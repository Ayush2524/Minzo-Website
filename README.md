# Minzo AI — complete website with sign-in

This is the full deployable project: the redesigned marketing website, artwork, Google/GitHub sign-in, protected learning journey and sign-out. Extract the ZIP before deploying. It is a Next.js project, not a single static HTML file.

**Start with [SETUP.md](SETUP.md)** to connect your existing Supabase project. Without the required settings, the page honestly shows “Sign-in is not ready yet” and the journey remains locked.

## Deploy this complete version

1. Extract the ZIP and use the `Minzo-AI-Complete` folder as the project root. It must contain `package.json`, `next.config.mjs`, `app`, `server`, `private` and `public`.
2. Put that source in your Vercel project's connected repository, or deploy the folder with Vercel CLI linked to the existing project. Keep the existing project to retain `minzo-website.vercel.app` and connected domains.
3. Set Framework Preset to **Next.js**, Node.js to **24.x**, and leave Output Directory at the Next.js default. Build Command is `npm run build` (or `pnpm run build` when using the included lockfile). Do not use the old static `dist` or `public` output override.
4. Add the environment variables and provider settings from `SETUP.md`.
5. Deploy, then complete the real sign-in checks listed in that guide.

Vercel publishes source changes as a new deployment in the same project. You do not need a new site, domain or hosting account. Clicking Redeploy on an old deployment without changing its source will not add these files. [Vercel deployments](https://vercel.com/docs/deployments)

## Local commands

Node 24 is used for the supplied build and tests. [Vercel Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

```sh
npm install
npm test
npm run build
npm run dev
```

Or use `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build`, `pnpm dev` with the included pnpm lockfile. Choose one package manager and commit its resulting lockfile. For local real sign-in, create `.env.local` from `.env.example`, set `APP_URL=http://localhost:3000` and add the local callback to Supabase's redirect list. The `/signin` layout can be previewed without credentials, but sign-in cannot complete.

## Project map

| Location | Purpose |
| --- | --- |
| `public/index.html`, `public/style.css`, `public/app.js` | Complete marketing website |
| `public/signin.html`, `public/auth/` | Sign-in screens, CTA gate and session client |
| `private/journey/` | Protected learning interface and content |
| `public/journey/assets/` | Original Minzo artwork and font |
| `server/minzo/` | Supabase authentication and journey access checks |
| `app/api/` | Next.js server route adapters |
| `minzo-auth.config.mjs` | Routes protected journey URLs before static file matching |
| `supabase/website-signins.sql` | Optional website acquisition tracking |
| `tests/auth.test.mjs` | Authentication and access-control checks |

The existing redesign and story flow are retained. No additional motion-design work was added. See `TEST-REPORT.md` for validation and live-service limitations.
