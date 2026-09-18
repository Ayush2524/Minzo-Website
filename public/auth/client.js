(() => {
  if (window.MinzoAuth) return;
  let configPromise;
  async function config() {
    if (!configPromise) configPromise = fetch('/api/minzo-auth?action=config',{cache:'no-store',credentials:'same-origin'})
      .then(async r => {const data = await r.json(); if (!r.ok) throw new Error(data.error || 'Sign-in is temporarily unavailable.'); return data;})
      .catch(e => {configPromise = null; throw e;});
    return configPromise;
  }
  async function session() {
    const r = await fetch('/api/minzo-auth?action=session',{cache:'no-store',credentials:'same-origin'});
    if (r.status === 401) return null;
    const data = await r.json();
    if (!r.ok) { const error = new Error(data.error || 'We couldn’t check your sign-in.'); error.code = data.code; throw error; }
    return data.user;
  }
  async function post(action,body) {
    const settings = await config();
    if (!settings.configured) throw new Error(settings.message || 'Sign-in is not ready yet. Please try again later.');
    const r = await fetch(`/api/minzo-auth?action=${action}`,{method:'POST',cache:'no-store',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Minzo-CSRF':settings.csrf},body:JSON.stringify(body)});
    const result = await r.json();
    if (!r.ok) {
      if (result.code === 'invalid_csrf') configPromise = null;
      const error = new Error(result.error || 'Please try again.'); error.code = result.code; throw error;
    }
    return result;
  }
  function signin(next = '/journey/') {location.assign('/signin?next='+encodeURIComponent(next === '/#try-it' ? next : '/journey/'));}
  async function requireUser(next) {
    try { const user = await session(); if (user) return user; }
    catch (error) { if (error.code !== 'auth_not_configured') throw error; }
    signin(next); return null;
  }
  window.MinzoAuth = {config,session,post,signin,requireUser};
})();
