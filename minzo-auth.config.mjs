// Wrap an existing Next config; existing redirects, headers and rewrites are retained.
export function withMinzoAuth(config = {}) {
  if (typeof config === 'function') return async (...args) => withMinzoAuth(await config(...args));
  if (config.output === 'export') throw new Error('Minzo sign-in needs server routes. Remove output: export before using this configuration.');
  const oldRewrites = config.rewrites;
  const oldHeaders = config.headers;
  return {
    ...config,
    outputFileTracingIncludes: {
      ...config.outputFileTracingIncludes,
      '/api/minzo-journey': [...(config.outputFileTracingIncludes?.['/api/minzo-journey'] || []), './private/journey/**/*'],
      '/': [...(config.outputFileTracingIncludes?.['/'] || []), './public/index.html']
    },
    async rewrites() {
      const existing = oldRewrites ? await oldRewrites() : [];
      const rules = [
        {source:'/signin',destination:'/signin.html'},
        {source:'/auth/minzo-callback',destination:'/api/minzo-auth?action=callback'},
        ...['index.html','app.js','style.css','content.json'].map(file => ({source:`/journey/${file}`,destination:`/api/minzo-journey?file=${file}`})),
        {source:'/journey',destination:'/api/minzo-journey?file=index.html'},
        {source:'/journey/',destination:'/api/minzo-journey?file=index.html'}
      ];
      return {beforeFiles:[...rules,...(existing.beforeFiles || [])],afterFiles:Array.isArray(existing)?existing:(existing.afterFiles || []),fallback:existing.fallback || []};
    },
    async headers() {
      return [
        ...(oldHeaders ? await oldHeaders() : []),
        {source:'/signin(.*)',headers:[{key:'Cache-Control',value:'no-store'}]},
        {source:'/api/minzo-auth',headers:[{key:'Cache-Control',value:'no-store'}]},
        {source:'/api/minzo-journey',headers:[{key:'Cache-Control',value:'no-store'}]},
        {source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'}]}
      ];
    }
  };
}
