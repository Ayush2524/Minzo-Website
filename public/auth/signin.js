'use strict';
const $ = selector => document.querySelector(selector);
const next = new URLSearchParams(location.search).get('next') === '/#try-it' ? '/#try-it' : '/journey/';
let method = 'email', contact = '', busy = false, config = null, captchaToken = '', captchaWidget, countdown;
function showMessage(text, success = false) {$('#auth-message').textContent=text;$('#auth-message').hidden=!text;$('#auth-message').classList.toggle('success',success);}
function view(name) {for (const key of ['choices','contact','code']) $(`#${key}-view`).hidden=key!==name;showMessage('');$('#captcha-container').hidden=!config?.turnstileSiteKey||name==='choices';}
function setBusy(value) {busy=value;document.querySelectorAll('form button,.auth-option,.back-button').forEach(b=>b.disabled=value);}
async function run(action) {if(busy)return;setBusy(true);showMessage('');try{await action();}catch(e){showMessage(e.message);}finally{setBusy(false);}}
function resetCaptcha() {captchaToken='';if(captchaWidget!==undefined)window.turnstile?.reset(captchaWidget);}
function cooldown(seconds=60) {
  clearInterval(countdown);const until=Date.now()+seconds*1000;
  function tick(){const remaining=Math.max(0,Math.ceil((until-Date.now())/1000));$('#resend-button').disabled=remaining>0;$('#resend-button').textContent=remaining?`Resend in ${remaining}s`:'Resend code';if(!remaining)clearInterval(countdown);}
  tick();countdown=setInterval(tick,1000);
}
function selectMethod(value) {
  method=value;view('contact');const email=method==='email';
  $('#contact-title').textContent=email?'What’s your email?':'What’s your number?';
  $('#contact-description').textContent=email?'We’ll email you a one-time sign-in code.':'We’ll text you a one-time sign-in code.';
  $('#contact-label').textContent=email?'Email address':'Phone number';
  $('#contact-input').type=email?'email':'tel';$('#contact-input').autocomplete=email?'email':'tel';
  $('#contact-input').placeholder=email?'you@example.com':'+91 98765 43210';$('#contact-input').value='';
  $('#contact-help').textContent=email?'Use an address you can check right now.':'Include your country code. We’ll send an SMS.';
  $('#contact-input').focus();
}
function contactBody(){return{method,[method==='email'?'email':'phone']:contact};}
async function sendCode() {
  let result;
  try {result=await window.MinzoAuth.post('send-code',{...contactBody(),captchaToken});}
  catch(e){resetCaptcha();throw e;}
  resetCaptcha();view('code');$('#code-title').textContent=method==='email'?'Check your inbox.':'Check your messages.';
  $('#code-destination').textContent=contact;$('#code-input').value='';$('#delivery-help').textContent=method==='email'?'Check your spam folder too.':'A text message can take a moment to arrive.';
  cooldown(result.retryAfter);$('#code-input').focus();
}
$('#email-button').onclick=()=>selectMethod('email');$('#phone-button').onclick=()=>selectMethod('phone');
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{view('choices');$('#google-button').focus();});
$('#edit-contact').onclick=()=>{view('contact');$('#contact-input').focus();};
$('#google-button').onclick=()=>run(async()=>{const result=await window.MinzoAuth.post('google',{next});location.assign(result.url);});
$('#contact-form').onsubmit=event=>{event.preventDefault();contact=$('#contact-input').value.trim();run(sendCode);};
$('#code-form').onsubmit=event=>{event.preventDefault();run(async()=>{const result=await window.MinzoAuth.post('verify-code',{...contactBody(),code:$('#code-input').value.trim(),next});showMessage('You’re signed in. Your next chapter is ready.',true);location.replace(result.next);});};
$('#resend-button').onclick=()=>run(async()=>{try{await sendCode();showMessage('A fresh code is on its way.',true);}catch(e){resetCaptcha();if(e.code==='rate_limited')cooldown();throw e;}});
$('#code-input').addEventListener('input',()=>{$('#code-input').value=$('#code-input').value.replace(/\D/g,'').slice(0,10);});
async function init() {
  try {
    config=await window.MinzoAuth.config();
    if(!config.configured){showMessage(config.message);return;}
    if(new URLSearchParams(location.search).has('error'))showMessage('Google sign-in didn’t finish. Please try again, or choose email or phone.');
    if(config.turnstileSiteKey){
      const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
      script.onload=()=>{captchaWidget=window.turnstile.render('#captcha-widget',{sitekey:config.turnstileSiteKey,size:'flexible',callback:token=>{captchaToken=token;},'expired-callback':()=>{captchaToken='';},'error-callback':()=>{captchaToken='';showMessage('The security check needs another try. Refresh this page.');}});};
      script.onerror=()=>showMessage('The security check couldn’t load. Please refresh and try again.');document.head.append(script);
    }
    const user=await window.MinzoAuth.session();if(user)location.replace(next);
  }catch(e){showMessage(e.message);}
}
init();
