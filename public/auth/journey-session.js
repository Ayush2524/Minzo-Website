(() => {
  let checking = false, leaving = false;
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('minzo-auth') : null;
  function leave() {
    leaving = true;
    document.querySelector('#dialog')?.close();
    document.querySelector('#app')?.replaceChildren();
    location.replace('/signin?next=%2Fjourney%2F');
  }
  function failure(message) {
    const root = document.querySelector('#app');
    root.replaceChildren();
    const box = document.createElement('main'); box.className = 'completion';
    const title = document.createElement('h1'); title.textContent = 'Your journey needs a moment.';
    const text = document.createElement('p'); text.textContent = message;
    const button = document.createElement('button'); button.className = 'primary'; button.textContent = 'Try again'; button.onclick = () => location.reload();
    box.append(title,text,button); root.append(box);
  }
  async function check() {
    if (checking || leaving) return;
    checking = true;
    try {
      const user = await window.MinzoAuth.session();
      if (!user || (window.MinzoUser && user.id !== window.MinzoUser.id)) return leave();
      return user;
    } finally { checking = false; }
  }
  window.MinzoSession = {
    async signOut() {
      await window.MinzoAuth.post('signout',{});
      channel?.postMessage('signed-out');
      leave();
    }
  };
  if (channel) channel.onmessage = event => {if(event.data === 'signed-out') leave();};
  async function resume() {try {await check();} catch {failure('We couldn’t verify your sign-in. Please reconnect and try again.');}}
  window.addEventListener('pageshow',event => {if(event.persisted) resume();});
  document.addEventListener('visibilitychange',() => {if(!document.hidden && window.MinzoUser) resume();});
  setInterval(() => {if(!document.hidden && window.MinzoUser) resume();},300000);
  (async () => {
    try {
      const user = await check(); if(!user) return;
      window.MinzoUser = user;
      const script = document.createElement('script'); script.src='/journey/app.js';
      script.onerror=() => failure('The learning path couldn’t load. Please try again.');
      document.body.append(script);
    } catch {failure('We couldn’t verify your sign-in. Please reconnect and try again.');}
  })();
})();
