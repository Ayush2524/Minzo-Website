import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthHandler } from '../server/minzo/auth-handler.js';
import { createJourneyHandler } from '../server/minzo/journey-handler.js';
import { asNextRoute } from '../server/minzo/next-adapter.js';
import { settings, createSupabase, setCookie } from '../server/minzo/auth.js';
import { withMinzoAuth } from '../minzo-auth.config.mjs';

const env = {APP_URL:'https://minzo-website.vercel.app',SUPABASE_URL:'https://test-project.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test_only',NODE_ENV:'production'};
const token = 'a'.repeat(64);
const user = {id:'00000000-0000-4000-8000-000000000001',email:'learner@minzo.test',email_confirmed_at:'2026-09-18T00:00:00Z',user_metadata:{name:'Learner'}};
function response() {
  const headers = {};
  return {statusCode:200,headers,setHeader(k,v){headers[k.toLowerCase()]=v;},getHeader(k){return headers[k.toLowerCase()];},end(body){this.body=body;},data(){return JSON.parse(this.body);}};
}
function client(overrides={}) {return {auth:{getUser:async()=>({data:{user}}),signInWithOtp:async()=>({error:null}),verifyOtp:async()=>({data:{session:{access_token:'never_return_this'}}}),exchangeCodeForSession:async()=>({error:null}),signOut:async()=>({error:null}),signInWithOAuth:async()=>({data:{url:env.SUPABASE_URL+'/auth/v1/authorize?provider=google'}}),...overrides}};}
function request(action,body={},extra={}) {
  return {url:'/api/minzo-auth?action='+action,method:['config','session','callback'].includes(action)?'GET':'POST',headers:{origin:env.APP_URL,'content-type':'application/json',cookie:'minzo-csrf='+token,'x-minzo-csrf':token},body,...extra};
}
async function auth(action,{body={},client:provided=client(),config=env,extra={}}={}) {
  const res=response();await createAuthHandler({env:config,getClient:()=>provided})(request(action,body,extra),res);return res;
}
test('missing setup fails closed and exposes no credentials',async()=>{
  const config=await auth('config',{config:{}});assert.equal(config.data().configured,false);assert.equal(config.statusCode,200);
  const session=await auth('session',{config:{}});assert.equal(session.statusCode,503);assert.equal(session.data().code,'auth_not_configured');
});
test('admin keys and insecure production origins are rejected',()=>{
  for(const changes of [{SUPABASE_PUBLISHABLE_KEY:'sb_secret_admin'},{APP_URL:'http://minzo-website.vercel.app'},{SUPABASE_PUBLISHABLE_KEY:'eyJ.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.sig'}]) assert.throws(()=>settings({...env,...changes}));
});
test('config creates a secure HttpOnly CSRF cookie without sending Supabase keys',async()=>{
  const r=await auth('config');assert.equal(r.data().csrf,token);assert.ok(r.headers['set-cookie'][0].includes('HttpOnly'));assert.ok(r.headers['set-cookie'][0].includes('Secure'));assert.match(r.headers['set-cookie'][0],/SameSite=Lax/);assert.ok(!r.body.includes(env.SUPABASE_PUBLISHABLE_KEY));
});
test('session includes verified public identity and disables all caches',async()=>{
  const r=await auth('session');assert.equal(r.data().user.id,user.id);assert.ok(!r.body.includes('access_token'));assert.match(r.headers['cache-control'],/private, no-store/);assert.equal(r.headers['vercel-cdn-cache-control'],'no-store');
});
test('anonymous, unconfirmed, and forged-cookie users cannot enter',async()=>{
  for(const result of [{data:{user:{...user,is_anonymous:true}}},{data:{user:{...user,email_confirmed_at:null}}},{data:{user:null},error:{status:401}}]) {
    const r=await auth('session',{client:client({getUser:async()=>result}),extra:{headers:{cookie:'sb-test-auth-token=forged'}}});assert.equal(r.statusCode,401);assert.equal(r.data().user,null);
  }
});
test('phone-only verified users can enter',async()=>{
  const r=await auth('session',{client:client({getUser:async()=>({data:{user:{id:user.id,phone:'+919876543210',phone_confirmed_at:'2026-09-18'}}})})});assert.equal(r.statusCode,200);assert.equal(r.data().user.phone,'+919876543210');
});
test('outages do not become signed-out or signed-in success responses',async()=>{
  const r=await auth('session',{client:client({getUser:async()=>({error:{status:503,name:'AuthRetryableFetchError'}})})});assert.equal(r.statusCode,503);
});
test('cross-origin and invalid CSRF mutations never call Supabase',async()=>{
  for(const headers of [{...request('google').headers,origin:'https://attacker.test'},{...request('google').headers,'x-minzo-csrf':'b'.repeat(64)},{...request('google').headers,cookie:''}]) {
    const r=response();let called=false;await createAuthHandler({env,getClient:()=>{called=true;return client();}})(request('google',{}, {headers}),r);assert.equal(r.statusCode,403);assert.equal(called,false);
  }
});
test('wrong methods and malformed bodies are rejected',async()=>{
  assert.equal((await auth('send-code',{extra:{method:'GET'}})).statusCode,405);
  assert.equal((await auth('send-code',{body:'{broken'})).statusCode,400);
  assert.equal((await auth('send-code',{body:'x'.repeat(4097)})).statusCode,413);
  assert.equal((await auth('send-code',{body:{method:'phone',phone:'9876543210'}})).statusCode,400);
  assert.equal((await auth('send-code',{body:{method:'email',email:'not-email'}})).statusCode,400);
});
test('email sends a passwordless signup/login request with normalized address',async()=>{
  let sent;const r=await auth('send-code',{body:{method:'email',email:' Learner@Minzo.Test '},client:client({signInWithOtp:async args=>{sent=args;return {};}})});
  assert.equal(r.data().sent,true);assert.equal(sent.email,'learner@minzo.test');assert.equal(sent.options.shouldCreateUser,true);
});
test('phone uses SMS, E.164, and a profile-compatible non-PII username',async()=>{
  let sent;const r=await auth('send-code',{body:{method:'phone',phone:'+91 (98765) 43210'},client:client({signInWithOtp:async args=>{sent=args;return {};}})});
  assert.equal(r.statusCode,200);assert.equal(sent.channel,'sms');assert.equal(sent.phone,'+919876543210');assert.match(sent.options.data.username,/^minzo_[a-f0-9]{12}$/);
});
test('enabled captcha is required and passed to Supabase',async()=>{
  const config={...env,TURNSTILE_SITE_KEY:'test-site-key'};const body={method:'email',email:user.email};
  assert.equal((await auth('send-code',{config,body})).data().code,'captcha_required');
  let sent;assert.equal((await auth('send-code',{config,body:{...body,captchaToken:'test-token'},client:client({signInWithOtp:async args=>{sent=args;return {};}})})).statusCode,200);assert.equal(sent.options.captchaToken,'test-token');
});
test('delivery failures and rate limits never pretend a message was sent',async()=>{
  for(const status of [429,503]) {const r=await auth('send-code',{body:{method:'email',email:user.email},client:client({signInWithOtp:async()=>({error:{status}})})});assert.equal(r.statusCode,status);assert.equal(r.data().sent,undefined);if(status===429)assert.equal(r.headers['retry-after'],'60');}
});
test('invalid codes and missing sessions cannot complete sign-in',async()=>{
  const body={method:'email',email:user.email,code:'123456'};
  assert.equal((await auth('verify-code',{body:{...body,code:'12'}})).statusCode,400);
  assert.equal((await auth('verify-code',{body,client:client({verifyOtp:async()=>({error:{status:403,code:'otp_expired'}})})})).data().code,'invalid_code');
  assert.equal((await auth('verify-code',{body,client:client({verifyOtp:async()=>({data:{session:null}})})})).statusCode,401);
});
test('verified email and phone codes return only a safe destination',async()=>{
  for(const contact of [{method:'email',email:user.email},{method:'phone',phone:'+919876543210'}]) {
    let sent;const r=await auth('verify-code',{body:{...contact,code:'123456',next:'https://attacker.test'},client:client({verifyOtp:async args=>{sent=args;return {data:{session:{access_token:'secret'}}};}})});
    assert.equal(r.statusCode,200);assert.equal(sent.type,contact.method==='phone'?'sms':'email');assert.deepEqual(r.data(),{next:'/journey/'});
  }
});
test('Google uses this site callback and rejects an unexpected provider URL',async()=>{
  let sent;const r=await auth('google',{body:{next:'/#try-it'},client:client({signInWithOAuth:async args=>{sent=args;return {data:{url:env.SUPABASE_URL+'/auth/v1/authorize'}};}})});
  assert.equal(r.statusCode,200);assert.equal(sent.options.redirectTo,env.APP_URL+'/auth/minzo-callback');assert.match(r.headers['set-cookie'][0],/HttpOnly/);
  assert.equal((await auth('google',{client:client({signInWithOAuth:async()=>({data:{url:'https://attacker.test'}})})})).statusCode,503);
});
test('real SSR OAuth implementation sets a secure PKCE verifier cookie',async()=>{
  const req=request('google');const res=response();const sdk=createSupabase(req,res,env);
  const {data,error}=await sdk.auth.signInWithOAuth({provider:'google',options:{redirectTo:env.APP_URL+'/auth/minzo-callback',skipBrowserRedirect:true}});
  assert.equal(error,null);assert.match(data.url,/code_challenge=/);assert.match(data.url,/code_challenge_method=s256/);
  assert.ok(res.headers['set-cookie'].some(value=>/code-verifier/.test(value)&&/HttpOnly/.test(value)&&/Secure/.test(value)&&/SameSite=Lax/.test(value)));
});
test('OAuth callback verifies user and cannot redirect outside Minzo',async()=>{
  const extra={url:'/auth/minzo-callback?code=valid',headers:{cookie:'minzo-next=https%3A%2F%2Fattacker.test'}};
  const r=await auth('callback',{extra});assert.equal(r.statusCode,303);assert.equal(r.headers.location,'/journey/');
  assert.equal((await auth('callback',{extra,client:client({exchangeCodeForSession:async()=>({error:{status:400}})})})).headers.location,'/signin?error=google');
});
test('sign out clears all session cookie chunks; upstream errors remain errors',async()=>{
  const extra={headers:{...request('signout').headers,cookie:'minzo-csrf='+token+'; sb-project-auth-token.0=old; sb-project-auth-token.1=old'}};
  const r=await auth('signout',{extra});assert.equal(r.data().signedOut,true);assert.equal(r.headers['set-cookie'].length,2);assert.ok(r.headers['set-cookie'].every(c=>/Max-Age=0/.test(c)));
  assert.equal((await auth('signout',{client:client({signOut:async()=>({error:{status:503}})})})).statusCode,503);
});
test('optional acquisition failures do not block verified users',async()=>{
  const c=client();c.rpc=async()=>({error:{code:'TEST_UNAVAILABLE'}});const r=await auth('verify-code',{config:{...env,RECORD_WEBSITE_SIGNINS:'true'},body:{method:'email',email:user.email,code:'123456'},client:c});assert.equal(r.statusCode,200);
});
async function journey(file,authenticated=true,method='GET') {
  const res=response();await createJourneyHandler({env,getClient:()=>client({getUser:async()=>({data:{user:authenticated?user:null}})})})({url:'/api/minzo-journey?file='+encodeURIComponent(file),method,headers:{}},res);return res;
}
test('direct journey HTML, script and content URLs are protected',async()=>{
  for(const file of ['index.html','app.js','style.css','content.json']) {const r=await journey(file,false);assert.equal(r.statusCode,file==='index.html'?303:401);assert.match(r.headers['cache-control'],/no-store/);}
});
test('authenticated journey allows only known files and HEAD has no body',async()=>{
  assert.equal((await journey('content.json')).statusCode,200);assert.equal((await journey('../.env')).statusCode,404);assert.equal((await journey('content.json',true,'HEAD')).body,undefined);assert.equal((await journey('content.json',true,'POST')).statusCode,405);
});
test('Next adapter preserves separate cookies and rejects oversized streams',async()=>{
  const route=asNextRoute(async(req,res)=>{setCookie(res,'one','1');setCookie(res,'two','2');res.end('ok');});
  const r=await route(new Request(env.APP_URL));assert.equal(r.headers.getSetCookie().length,2);
  const large=await route(new Request(env.APP_URL,{method:'POST',body:'x'.repeat(4097)}));assert.equal(large.status,413);
});
test('Next wrapper protects files before public matching and preserves project rules',async()=>{
  const config=withMinzoAuth({rewrites:async()=>[{source:'/old',destination:'/new'}],headers:async()=>[{source:'/other',headers:[{key:'x-test',value:'preserved'}]}]});
  const rules=await config.rewrites();assert.ok(rules.beforeFiles.some(x=>x.source==='/journey/content.json'));assert.equal(rules.afterFiles[0].source,'/old');assert.equal((await config.headers())[0].source,'/other');assert.throws(()=>withMinzoAuth({output:'export'}));
});
