import { randomBytes } from 'node:crypto';
import { HttpError, settings, noStore, json, redirect, cookies, setCookie, safeNext, createSupabase, csrfToken, checkMutation, readBody, contactFrom, verifiedUser, publicUser, providerError, recordSignin } from './auth.js';

export function createAuthHandler({ getClient = createSupabase, env = process.env } = {}) {
  return async function auth(req, res) {
    noStore(res);
    const url = new URL(req.url, 'https://minzo.invalid');
    const action = req.query?.action || url.searchParams.get('action') || (url.pathname === '/auth/minzo-callback' ? 'callback' : 'session');
    try {
      if (!['config', 'session', 'google', 'send-code', 'verify-code', 'callback', 'signout'].includes(action)) throw new HttpError(404, 'This action is not available.');
      const method = ['config', 'session', 'callback'].includes(action) ? 'GET' : 'POST';
      if (req.method !== method) { res.setHeader('Allow', method); throw new HttpError(405, 'This method is not allowed.'); }
      let config;
      try { config = settings(env); }
      catch (error) { if (action === 'config') return json(res, 200, { configured: false, message: error.message }); throw error; }
      if (action === 'config') return json(res, 200, { configured: true, csrf: csrfToken(req, res, config), turnstileSiteKey: config.turnstile });
      if (method === 'POST') checkMutation(req, config);
      const client = getClient(req, res, env);
      if (action === 'session') {
        const user = await verifiedUser(client);
        return json(res, user ? 200 : 401, { user: user ? publicUser(user) : null });
      }
      if (action === 'callback') {
        const code = url.searchParams.get('code') || req.query?.code;
        if (typeof code !== 'string' || !code || code.length > 2048 || url.searchParams.has('error')) return redirect(res, '/signin?error=google');
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error || !(await verifiedUser(client))) return redirect(res, '/signin?error=google');
        const next = safeNext(cookies(req)['minzo-next']);
        setCookie(res, 'minzo-next', '', { secure: config.secure, maxAge: 0 });
        await recordSignin(client, env);
        return redirect(res, next);
      }
      const body = await readBody(req);
      if (action === 'google') {
        setCookie(res, 'minzo-next', safeNext(body.next), { secure: config.secure, maxAge: 600 });
        const { data, error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${config.origin}/auth/minzo-callback`, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } } });
        if (error || !data?.url) throw new HttpError(503, 'Google sign-in is unavailable. Try email or phone.', 'google_unavailable');
        const destination = new URL(data.url);
        if (destination.origin !== new URL(config.supabaseUrl).origin || destination.protocol !== 'https:') throw new HttpError(503, 'Google sign-in is unavailable.', 'invalid_provider_url');
        return json(res, 200, { url: destination.href });
      }
      if (action === 'send-code') {
        const contact = contactFrom(body);
        if (config.turnstile && (typeof body.captchaToken !== 'string' || !body.captchaToken)) throw new HttpError(400, 'Please complete the security check.', 'captcha_required');
        // The existing mobile profile trigger expects a username, even for users without email.
        const profile = contact.phone ? { data: { username: 'minzo_' + randomBytes(6).toString('hex') } } : {};
        const { error } = await client.auth.signInWithOtp({ ...contact, ...(contact.phone ? { channel: 'sms' } : {}), options: { shouldCreateUser: true, ...profile, ...(body.captchaToken ? { captchaToken: body.captchaToken } : {}) } });
        if (error) throw providerError(error);
        return json(res, 200, { sent: true, retryAfter: 60 });
      }
      if (action === 'verify-code') {
        const contact = contactFrom(body);
        const token = typeof body.code === 'string' ? body.code.trim().replace(/\s/g, '') : '';
        if (!/^\d{6,10}$/.test(token)) throw new HttpError(400, 'Enter the complete code from your message.', 'invalid_code');
        const { data, error } = await client.auth.verifyOtp({ ...contact, token, type: contact.email ? 'email' : 'sms' });
        if (error) throw providerError(error, true);
        if (!data?.session || !(await verifiedUser(client))) throw new HttpError(401, 'Sign-in could not be verified. Please try again.', 'unverified_session');
        await recordSignin(client, env);
        return json(res, 200, { next: safeNext(body.next) });
      }
      if (action === 'signout') {
        const { error } = await client.auth.signOut({ scope: 'local' });
        if (error && ![401, 403, 404].includes(error.status)) throw new HttpError(503, 'We couldn’t sign you out. Please try again.', 'signout_failed');
        // Clear every chunk even if the upstream session has already expired.
        for (const name of Object.keys(cookies(req))) if (/^sb-.+-auth-token(?:\.\d+)?$/.test(name)) setCookie(res, name, '', { secure: config.secure, maxAge: 0 });
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
