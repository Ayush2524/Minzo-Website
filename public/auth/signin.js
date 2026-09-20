'use strict';
const $ = selector => document.querySelector(selector);
const next = new URLSearchParams(location.search).get('next') === '/#try-it' ? '/#try-it' : '/journey/';
let busy = false;
function showMessage(text, success = false) {$('#auth-message').textContent=text;$('#auth-message').hidden=!text;$('#auth-message').classList.toggle('success',success);}
function setBusy(value) {busy=value;document.querySelectorAll('.auth-option').forEach(b=>b.disabled=value);}
async function run(action) {if(busy)return;setBusy(true);showMessage('');try{await action();}catch(e){showMessage(e.message);}finally{setBusy(false);}}
function signIn(provider) {return run(async()=>{const result=await window.MinzoAuth.post(provider,{next});location.assign(result.url);});}
$('#google-button').onclick=()=>signIn('google');
$('#github-button').onclick=()=>signIn('github');
async function init() {
  // Check the session before ever showing the sign-in options, so an
  // already-signed-in visitor never sees this form flash before the redirect.
  try {
    const user = await window.MinzoAuth.session();
    if (user) { location.replace(next); return; }
  } catch (e) {
    if (e.code !== 'auth_not_configured') { showMessage(e.message); $('#choices-view').hidden = false; return; }
  }
  try {
    const config = await window.MinzoAuth.config();
    if (!config.configured) { showMessage(config.message); return; }
    if (new URLSearchParams(location.search).has('error')) showMessage('Sign-in didn’t finish. Please try again.');
    $('#choices-view').hidden = false;
  } catch (e) { showMessage(e.message); }
}
init();
