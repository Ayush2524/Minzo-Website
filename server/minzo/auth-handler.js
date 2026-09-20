import { HttpError, settings, noStore, json, redirect, cookies, setCookie, safeNext, createSupabase, csrfToken, checkMutation, readBody, verifiedUser, publicUser, recordSignin, rateLimit, clientIp } from './auth.js';
const OAUTH_LABEL = { google: 'Google', github: 'GitHub' };

export function createAuthHandler({ getClient = createSupabase, env = process.env } = {}) {
  return async function auth(req, res) {
    noStore(res);
    const url = new URL(req.url, 'https://minzo.invalid');
    const action = req.query?.action || url.searchParams.get('action') || (url.pathname === '/auth/minzo-callback' ? 'callback' : 'session');
    try {
      if (!['config', 'session', 'google', 'github', 'callback', 'signout'].includes(action)) throw new HttpError(404, 'This action is not available.');
      const method = ['config', 'session', 'callback'].includes(action) ? 'GET' : 'POST';
      if (req.method !== method) { res.setHeader('Allow', method); throw new HttpError(405, 'This method is not allowed.'); }
      let config;
      try { config = settings(env); }
      catch (error) { if (action === 'config') return json(res, 200, { configured: false, message: error.message }); throw error; }
      if (action === 'config') return json(res, 200, { configured: true, csrf: csrfToken(req, res, config) });
      if (method === 'POST') checkMutation(req, config);
      const client = getClient(req, res, env);
      if (action === 'session') {
        const user = await verifiedUser(client, req.headers.cookie);
        return json(res, user ? 200 : 401, { user: user ? publicUser(user) : null });
      }
      if (action === 'callback') {
        const code = url.searchParams.get('code') || req.query?.code;
        if (typeof code !== 'string' || !code || code.length > 2048 || url.searchParams.has('error')) return redirect(res, '/signin?error=oauth');
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error || !(await verifiedUser(client))) return redirect(res, '/signin?error=oauth');
        const next = safeNext(cookies(req)['minzo-next']);
        setCookie(res, 'minzo-next', '', { secure: config.secure, maxAge: 0 });
        await recordSignin(client, env);
        return redirect(res, next);
      }
      const body = await readBody(req);
      if (action === 'google' || action === 'github') {
        rateLimit(`oauth:${clientIp(req)}`, 10, 60000);
        setCookie(res, 'minzo-next', safeNext(body.next), { secure: config.secure, maxAge: 600 });
        const { data, error } = await client.auth.signInWithOAuth({ provider: action, options: { redirectTo: `${config.origin}/auth/minzo-callback`, skipBrowserRedirect: true, ...(action === 'google' ? { queryParams: { prompt: 'select_account' } } : {}) } });
        const label = OAUTH_LABEL[action], other = action === 'google' ? OAUTH_LABEL.github : OAUTH_LABEL.google;
        if (error || !data?.url) throw new HttpError(503, `${label} sign-in is unavailable. Try ${other} instead.`, `${action}_unavailable`);
        const destination = new URL(data.url);
        if (destination.origin !== new URL(config.supabaseUrl).origin || destination.protocol !== 'https:') throw new HttpError(503, `${label} sign-in is unavailable.`, 'invalid_provider_url');
        return json(res, 200, { url: destination.href });
      }
      if (action === 'signout') {
        const { error } = await client.auth.signOut({ scope: 'local' });
        if (error && ![401, 403, 404].includes(error.status)) throw new HttpError(503, 'We couldn’t sign you out. Please try again.', 'signout_failed');
        // Clear every chunk (session token, PKCE verifiers, etc.) even if the upstream session has already expired.
        for (const name of Object.keys(cookies(req))) if (/^sb-.+$/.test(name)) setCookie(res, name, '', { secure: config.secure, maxAge: 0 });
        return json(res, 200, { signedOut: true });
      }
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 503;
      if (status === 429) res.setHeader('Retry-After', '60');
      return json(res, status, { error: error instanceof HttpError ? error.message : 'Something interrupted sign-in. Please try again.', code: error.code || 'auth_unavailable' });
    }
  };
}
export default createAuthHandler();
