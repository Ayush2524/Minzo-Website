import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createServerClient } from '@supabase/ssr';
import { parseCookie as parse, stringifySetCookie } from 'cookie';

export class HttpError extends Error {
  constructor(status, message, code = 'request_failed') { super(message); this.status = status; this.code = code; }
}
export function settings(env = process.env) {
  let origin;
  try {
    const url = new URL(env.APP_URL);
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
    if (url.protocol !== 'https:' && !(env.NODE_ENV === 'development' && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error();
    origin = url.origin;
  } catch { throw new HttpError(503, 'Sign-in is not ready yet. Please try again later.', 'auth_not_configured'); }
  const supabaseUrl = env.SUPABASE_URL;
  const key = env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;
  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== 'https:' || url.username || url.password || /YOUR_|example/i.test(supabaseUrl) || !key || /YOUR_|replace/i.test(key)) throw new Error();
  } catch { throw new HttpError(503, 'Sign-in is not ready yet. Please try again later.', 'auth_not_configured'); }
  // This site only needs the publishable (or legacy anon) key, never an admin key.
  if (key.startsWith('sb_secret_')) throw new HttpError(503, 'Sign-in configuration needs attention.', 'wrong_key_type');
  if (key.startsWith('eyJ')) {
    try { if (JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role === 'service_role') throw new Error(); }
    catch { throw new HttpError(503, 'Sign-in configuration needs attention.', 'wrong_key_type'); }
  }
  return { origin, supabaseUrl, key, secure: origin.startsWith('https:') };
}
export function noStore(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Vary', 'Cookie');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
}
export function json(res, status, body) {
  res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body));
}
export function redirect(res, location) { res.statusCode = 303; res.setHeader('Location', location); res.end(); }
export function cookies(req) { return parse(req.headers.cookie || ''); }
export function setCookie(res, name, value, options = {}) {
  const existing = res.getHeader('Set-Cookie') || [];
  res.setHeader('Set-Cookie', [...(Array.isArray(existing) ? existing : [existing]), stringifySetCookie({ name, value, path: '/', httpOnly: true, sameSite: 'lax', ...options })]);
}
export function safeNext(value) { return value === '/#try-it' ? value : '/journey/'; }
export function createSupabase(req, res, env = process.env) {
  const config = settings(env);
  const jar = cookies(req);
  return createServerClient(config.supabaseUrl, config.key, {
    cookieOptions: { path: '/', httpOnly: true, sameSite: 'lax', secure: config.secure },
    cookies: {
      getAll() { return Object.entries(jar).map(([name, value]) => ({ name, value })); },
      setAll(items) {
        for (const { name, value, options } of items) {
          jar[name] = value;
          setCookie(res, name, value, { ...options, httpOnly: true, sameSite: 'lax', secure: config.secure, path: '/' });
        }
      }
    }
  });
}
export function csrfToken(req, res, config) {
  let token = cookies(req)['minzo-csrf'];
  if (!/^[a-f0-9]{64}$/.test(token || '')) token = randomBytes(32).toString('hex');
  setCookie(res, 'minzo-csrf', token, { secure: config.secure, maxAge: 3600 });
  return token;
}
export function checkMutation(req, config) {
  if (req.headers.origin !== config.origin) throw new HttpError(403, 'Please return to Minzo AI and try again.', 'invalid_origin');
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) throw new HttpError(415, 'A JSON request is required.');
  const expected = cookies(req)['minzo-csrf'];
  const actual = req.headers['x-minzo-csrf'];
  if (!/^[a-f0-9]{64}$/.test(expected || '') || !/^[a-f0-9]{64}$/.test(actual || '') || !timingSafeEqual(Buffer.from(expected), Buffer.from(actual))) {
    throw new HttpError(403, 'Your sign-in page expired. Refresh it and try again.', 'invalid_csrf');
  }
}
export async function readBody(req) {
  let body = req.body;
  if (body === undefined) {
    let raw = '';
    for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > 4096) throw new HttpError(413, 'This request is too large.'); }
    body = raw;
  }
  if (Buffer.isBuffer(body)) body = body.toString('utf8');
  if (typeof body === 'string') {
    if (Buffer.byteLength(body) > 4096) throw new HttpError(413, 'This request is too large.');
    try { body = JSON.parse(body); } catch { throw new HttpError(400, 'Please check your details and try again.'); }
  }
  if (!body || Array.isArray(body) || typeof body !== 'object' || Buffer.byteLength(JSON.stringify(body)) > 4096) throw new HttpError(400, 'Please check your details and try again.');
  return body;
}
export async function verifiedUser(client) {
  // getUser validates the token with Supabase; cookie contents alone never grant access.
  const { data, error } = await client.auth.getUser();
  if (error) {
    if (error.status >= 500 || error.name === 'AuthRetryableFetchError') throw new HttpError(503, 'We couldn’t check your session. Please try again.', 'auth_unavailable');
    return null;
  }
  const user = data?.user;
  if (!user || user.is_anonymous || (!user.email_confirmed_at && !user.phone_confirmed_at)) return null;
  return user;
}
export function publicUser(user) {
  return { id: user.id, email: user.email || null, phone: user.phone || null, name: user.user_metadata?.full_name || user.user_metadata?.name || null };
}
export async function recordSignin(client, env) {
  if (env.RECORD_WEBSITE_SIGNINS !== 'true') return;
  // Optional acquisition tracking must never prevent a valid user from signing in.
  try { const { error } = await client.rpc('minzo_record_web_signin'); if (error) console.warn('Minzo acquisition recording unavailable:', error.code || 'unknown'); }
  catch { console.warn('Minzo acquisition recording unavailable.'); }
}
