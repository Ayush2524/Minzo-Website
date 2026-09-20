# Connect Minzo AI sign-in

Your current website is https://minzo-website.vercel.app. Use the **same Supabase project as the app** so website accounts enter the same user database. The code is implemented; real Google and GitHub redirects need the following account settings. No real project credentials are included in this package.

## 1. Add the Vercel environment variables

Open your existing Vercel project → Settings → Environment Variables. Add these for Production, then deploy the updated source to that same project.

| Name | Value |
| --- | --- |
| `APP_URL` | `https://minzo-website.vercel.app` |
| `SUPABASE_URL` | The project URL from your Supabase project |
| `SUPABASE_PUBLISHABLE_KEY` | That project's publishable key, or its legacy `anon` key |
| `RECORD_WEBSITE_SIGNINS` | `false` initially; optionally `true` after step 4 |

Use the publishable/anon key, **never** a service-role or secret admin key. The Google and GitHub OAuth client secrets belong in Supabase provider settings. They do not go in the website files.

Use one canonical domain. Once `minzoai.com` is connected, change `APP_URL` to `https://minzoai.com`, add its callback URL below, redirect alternate domains to it, and redeploy. Vercel environment changes apply to a new deployment. [Environment variables](https://vercel.com/docs/environment-variables)

For a separate preview deployment, use its exact origin as Preview `APP_URL` and add its exact callback URL in Supabase. An origin mismatch is intentionally rejected. For local development use `.env.local`, `APP_URL=http://localhost:3000`, and `npm run dev`. Do not commit `.env.local`.

## 2. Enable Google

In Supabase Authentication → Sign In / Providers → Google, enable Google and enter the OAuth web client ID and secret from Google Cloud.

In Google Cloud's OAuth web client, use the Supabase callback displayed in the provider panel as the authorized redirect URI, normally:

```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

In Supabase Authentication → URL Configuration → Redirect URLs, add:

```
https://minzo-website.vercel.app/auth/minzo-callback
```

Later also add `https://minzoai.com/auth/minzo-callback`. Preserve the mobile app's existing redirect URLs and Site URL if it relies on them; this website sends its callback explicitly. If Google OAuth is in testing mode, only configured test users can sign in; finish the Google production setup for public users. [Supabase Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google)

## 3. Enable GitHub

In Supabase Authentication → Sign In / Providers → GitHub, enable GitHub and enter the OAuth app's Client ID and secret from GitHub.

Create (or reuse) an OAuth app under GitHub → Settings → Developer settings → OAuth Apps, and set its Authorization callback URL to the same Supabase callback used above:

```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

The redirect URLs added in step 2 (`/auth/minzo-callback`) already cover GitHub too — both providers return through the same site callback. [Supabase GitHub setup](https://supabase.com/docs/guides/auth/social-login/auth-github)

## 4. View your top-of-funnel users

All accounts appear under **Supabase Authentication → Users**, identified by whichever provider they signed in with.

For a website-specific acquisition list, run `supabase/website-signins.sql` in your project's SQL Editor, then set `RECORD_WEBSITE_SIGNINS=true` in Vercel and redeploy. It records one row per verified user, first website sign-in, most recent website sign-in and a sign-in count. It does not duplicate contact details. Join its `user_id` to `auth.users` in the Supabase dashboard when you need contact details. The SQL creates new Minzo-specific objects and leaves existing app tables and triggers alone.

This is acquisition tracking, not a marketing subscription or marketing automation. Auth Users is the primary account record; optional acquisition logging failures do not prevent sign-in. The counter is operational tracking, not an audit-grade event ledger.

## 5. Check the deployed result

Use a signed-out or private browser window on the configured domain:

1. Click the homepage's "Try a little lesson" link. It should scroll straight to the sample lesson with **no sign-in required**, and answering it should work immediately.
2. Click "Let's get started" or "Start learning". Signed out, this should lead to `/signin`. Complete Google sign-in using a test account, then repeat with GitHub. Confirm the journey opens each time, with no visible flash of the sign-in page mid-redirect.
3. Sign out from **You → Sign out**. Click "Start learning" again while signed out — it should stay on `/signin`, not bounce anywhere.
4. Sign back in, then click "Let's get started" again — it should go straight to `/journey/` without ever showing `/signin`.
5. While signed out, open `/journey/` directly. It should redirect to `/signin`; `/journey/content.json` and `/api/minzo-journey?file=content.json` should reject access.
6. Verify the account in Supabase Authentication → Users. If enabled, check `minzo_website_signins` too.
7. Confirm your existing mobile app can still sign in and its existing flows still work.

These production checks require your actual provider configuration. The delivered package has passed local handler tests and a production build, but no real Google or GitHub sign-in was completed against your Supabase account.

## What is included and what is local

The complete package contains the redesigned landing page, original artwork, two sign-in methods (Google and GitHub), verified sessions, sign-out, an open (no sign-in required) sample lesson on the homepage, and the existing interactive learning journey. The journey includes 20 learning checkpoints and companion encounters. Lesson progress remains stored **in this browser, separately for each verified account**. It does not sync lesson progress to the mobile app or another device.

Authentication is implemented with Supabase server calls and secure HttpOnly cookies. Visitors cannot unlock the journey with a localStorage flag. The protected HTML, lesson script and lesson content are served only after a Supabase user check. Artwork and the homepage sample lesson stay public. Failed verification does not reveal protected files. Supabase manages user and session data; this package does not implement the mobile app's complete backend features.

A plain HTML upload cannot provide this server protection. Deploy the project folder as **Next.js**, including its server routes and configuration. Never publish only the `public` folder. [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
