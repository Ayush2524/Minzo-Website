(() => {
  if (window.__minzoGateInstalled) return;
  window.__minzoGateInstalled = true;
  let replay = null;
  let pending = false;
  function message(text) {
    let box = document.querySelector('#minzo-gate-message');
    if (!box) {box=document.createElement('div');box.id='minzo-gate-message';box.setAttribute('role','alert');Object.assign(box.style,{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',zIndex:'9999',background:'#49352f',color:'#fff9ef',borderRadius:'12px',padding:'16px 22px',maxWidth:'90vw',font:'14px/1.5 system-ui'});document.body.append(box);}
    box.textContent=text;
    setTimeout(()=>box.remove(),6000);
  }
  // Capturing runs before the existing React/Next click handlers.
  document.addEventListener('click',async event => {
    const element = event.target.closest?.('a,button');
    if (!element) return;
    if (element === replay) {replay=null;return;}
    const link = element.tagName==='A' ? new URL(element.href,location.href) : null;
    const isJourney = link?.origin===location.origin && /^\/journey\/?$/.test(link.pathname);
    const isTry = link?.origin===location.origin && link.hash==='#try-it';
    const isAnswer = element.matches('[data-answer],.sample-options button');
    if (!isJourney&&!isTry&&!isAnswer) return;
    if (event.metaKey||event.ctrlKey||event.shiftKey||event.altKey) return; // Target URLs remain protected by the server.
    event.preventDefault();event.stopImmediatePropagation();
    if (pending) return;
    pending=true;
    const next=isJourney?'/journey/':'/#try-it';
    try {
      const user=await window.MinzoAuth.requireUser(next);
      if (!user) return;
      if (isAnswer) {replay=element;element.click();}
      else if (isTry) {document.querySelector('#try-it')?.scrollIntoView();history.replaceState(null,'','/#try-it');}
      else location.assign('/journey/');
    } catch (error) {message(error.message);}
    finally {pending=false;}
  },true);
  // Old pages may still contain this pre-auth sentence.
  function refreshCopy() {
    document.querySelectorAll('.sample-bottom span').forEach(el=>{if (/No sign-up/.test(el.textContent)) el.textContent='Sign in to try your first lesson.';});
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',refreshCopy,{once:true}); else refreshCopy();
})();
