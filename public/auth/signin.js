'use strict';
const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const next = params.get('next') === '/#try-it' ? '/#try-it' : '/journey/';
const oauthFailed = params.has('error');
let busy = false;
function showMessage(text, success = false) {$('#auth-message').textContent=text;$('#auth-message').hidden=!text;$('#auth-message').classList.toggle('success',success);}
function setBusy(value) {busy=value;document.querySelectorAll('.auth-option').forEach(b=>b.disabled=value);}
async function run(action) {if(busy)return;setBusy(true);showMessage('');try{await action();}catch(e){showMessage(e.message);}finally{setBusy(false);}}
function signIn(provider) {return run(async()=>{const result=await window.MinzoAuth.post(provider,{next});location.assign(result.url);});}
$('#google-button').onclick=()=>signIn('google');
$('#github-button').onclick=()=>signIn('github');
function reveal(message, showChoices) {
  $('#loading-view').hidden = true;
  if (message) showMessage(message);
  if (showChoices) { if (oauthFailed && !message) showMessage('Sign-in didn’t finish. Please try again.'); $('#choices-view').hidden = false; }
}
async function init() {
  // Fire both checks in parallel; only the session result decides whether we ever show the form,
  // so an already-signed-in visitor never sees it flash before the redirect.
  const sessionPromise = window.MinzoAuth.session().catch(error => ({ error }));
  const configPromise = window.MinzoAuth.config().catch(error => ({ error }));
  const sessionResult = await sessionPromise;
  if (sessionResult && !sessionResult.error) { location.replace(next); return; }
  // A genuine session-check failure (not just "not configured yet") still lets the visitor try to sign in.
  if (sessionResult && sessionResult.error && sessionResult.error.code !== 'auth_not_configured') return reveal(sessionResult.error.message, true);
  const config = await configPromise;
  if (config.error) return reveal(config.error.message, false);
  if (!config.configured) return reveal(config.message, false);
  reveal(null, true);
}
init();
