import {readFile} from 'node:fs/promises';
import path from 'node:path';
export const runtime = 'nodejs';
// Static marketing content: read once per cold start and reuse across warm invocations.
let cachedHtml;
export async function GET() {
  if (!cachedHtml) cachedHtml = await readFile(path.join(process.cwd(),'public','index.html'),'utf8');
  return new Response(cachedHtml,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=60, stale-while-revalidate=86400'}});
}
