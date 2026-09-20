import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { HttpError, noStore, json, redirect, createSupabase, verifiedUser } from './auth.js';

const TYPES = { 'index.html': 'text/html; charset=utf-8', 'app.js': 'text/javascript; charset=utf-8', 'style.css': 'text/css; charset=utf-8', 'content.json': 'application/json; charset=utf-8' };
// These four files are part of the deployment bundle and never change during a running instance's lifetime.
const fileCache = new Map();
async function readJourneyFile(root, file) {
  const cached = fileCache.get(file);
  if (cached) return cached;
  const data = await readFile(path.join(root, 'private', 'journey', file));
  fileCache.set(file, data);
  return data;
}
export function createJourneyHandler({ getClient = createSupabase, env = process.env, root = process.cwd() } = {}) {
  return async function journey(req, res) {
    noStore(res);
    if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return json(res, 405, { error: 'Method not allowed.' }); }
    const url = new URL(req.url, 'https://minzo.invalid');
    const file = req.query?.file || url.searchParams.get('file') || (url.pathname.startsWith('/journey/') ? url.pathname.slice('/journey/'.length) : '') || 'index.html';
    if (!Object.hasOwn(TYPES, file)) return json(res, 404, { error: 'Not found.' });
    try {
      const user = await verifiedUser(getClient(req, res, env), req.headers.cookie);
      if (!user) return file === 'index.html' ? redirect(res, '/signin?next=%2Fjourney%2F') : json(res, 401, { error: 'Sign in to continue.', code: 'signin_required' });
      // Only these four named files can be served, and only after remote verification.
      const data = await readJourneyFile(root, file);
      res.statusCode = 200; res.setHeader('Content-Type', TYPES[file]);
      if (file === 'index.html') res.setHeader('X-Frame-Options', 'DENY');
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) {
      if (error.code === 'auth_not_configured' && file === 'index.html') return redirect(res, '/signin?next=%2Fjourney%2F');
      return json(res, error instanceof HttpError ? error.status : 503, { error: error instanceof HttpError ? error.message : 'Your learning path is temporarily unavailable. Please try again.' });
    }
  };
}
export default createJourneyHandler();
