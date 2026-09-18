// The same tested handlers run behind Next.js Route Handlers.
export function asNextRoute(handler) {
  return async function route(request) {
    const headers = new Headers();
    const response = {
      statusCode: 200,
      setHeader(name, value) { headers.delete(name); for (const item of Array.isArray(value) ? value : [value]) headers.append(name, String(item)); },
      getHeader(name) { return name.toLowerCase() === 'set-cookie' ? headers.getSetCookie() : headers.get(name); },
      end(body) { this.body = body; }
    };
    const url = new URL(request.url);
    let body;
    if (!['GET', 'HEAD'].includes(request.method)) {
      if (Number(request.headers.get('content-length')) > 4096) return Response.json({error:'This request is too large.'}, {status:413,headers:{'Cache-Control':'no-store'}});
      const reader = request.body?.getReader();
      let total = 0; const chunks = [];
      if (reader) for (;;) {
        const {done,value} = await reader.read(); if (done) break;
        total += value.byteLength;
        if (total > 4096) { await reader.cancel(); return Response.json({error:'This request is too large.'}, {status:413,headers:{'Cache-Control':'no-store'}}); }
        chunks.push(value);
      }
      body = Buffer.concat(chunks).toString('utf8');
    }
    await handler({ method: request.method, url: request.url, headers: Object.fromEntries(request.headers), query: Object.fromEntries(url.searchParams), body }, response);
    return new Response(response.body ?? null, {status:response.statusCode,headers});
  };
}
