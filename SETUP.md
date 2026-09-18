# Connect Minzo AI sign-in

Your current website is https://minzo-website.vercel.app. Use the **same Supabase project as the app** so website accounts enter the same user database. The code is implemented; real Google redirects, email delivery and SMS delivery need the following account settings. No real project credentials are included in this package.

## 1. Add the Vercel environment variables

Open your existing Vercel project → Settings → Environment Variables. Add these for Production, then deploy the updated source to that same project.

| Name | Value |
| --- | --- |
| `APP_URL` | `https://minzo-website.vercel.app` |
| `SUPABASE_URL` | The project URL from your Supabase project |
| `SUPABASE_PUBLISHABLE_KEY` | That project's publishable key, or its legacy `anon` key |
| `RECORD_WEBSITE_SIGNINS` | `false` initially; optionally `true` after step 5 |

Use the publishable/anon key, **never** a service-role or secret admin key. The Google client secret and SMS provider credentials belong in Supabase provider settings. They do not go in the website files.

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

## 3. Enable email codes

Enable the Email provider and allow new user signups. Under Authentication → Email Templates → Magic Link, include `{{ .Token }}` in the email body so visitors receive a code they can type. This form uses an OTP, not a clickable magic-link callback. For example:

```html
<h2>Your Minzo AI sign-in code</h2>
<p>Enter this one-time code on the Minzo AI sign-in page:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
<p>If you did not request this, you can ignore this email.</p>
```

Supabase shares templates across the project. If your mobile app already uses magic links, **retain its existing `{{ .ConfirmationURL }}` link** and add the code instead of replacing the whole template. Test both flows. Configure a production SMTP provider and sender for delivery to visitors; Supabase's default mail service has restrictions and is unsuitable for a public funnel. Keep OTP length within the supported 6–10 digits. The resend UI waits 60 seconds; Supabase remains authoritative for rate limits and expiry. [Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

## 4. Enable phone codes

Enable Phone under Supabase Authentication providers. Connect a supported SMS provider and its credentials, configure its sender and permitted destination countries, and ensure it can send to your audience. Provider billing, regional sender requirements and trial restrictions must be handled in that provider account.

Visitors enter the number with country code, such as `+91 98765 43210`, and verify the SMS code. Phone-only signups include a generated username so they also work with the earlier app's `handle_new_user` profile trigger. No existing trigger is replaced. [Phone OTP setup](https://supabase.com/docs/guides/auth/phone-login)

If you enable CAPTCHA in Supabase, choose Cloudflare Turnstile, configure the secret there, and add the corresponding public site key as `TURNSTILE_SITE_KEY` in Vercel. Register the website hostname in Turnstile. The supplied form passes CAPTCHA tokens to Supabase. [CAPTCHA setup](https://supabase.com/docs/guides/auth/auth-captcha)

## 5. View your top-of-funnel users

All accounts appear under **Supabase Authentication → Users**. Google/email accounts have an email; phone-only accounts have a phone number. A requested code can create a pending account, so use confirmation status when counting verified users.

For a website-specific acquisition list, run `supabase/website-signins.sql` in your project's SQL Editor, then set `RECORD_WEBSITE_SIGNINS=true` in Vercel and redeploy. It records one row per verified user, first website sign-in, most recent website sign-in and a sign-in count. It does not duplicate contact details. Join its `user_id` to `auth.users` in the Supabase dashboard when you need contact details. The SQL creates new Minzo-specific objects and leaves existing app tables and triggers alone.

This is acquisition tracking, not a marketing subscription or marketing automation. Auth Users is the primary account record; optional acquisition logging failures do not prevent sign-in. The counter is operational tracking, not an audit-grade event ledger.

## 6. Check the deployed result

Use a signed-out or private browser window on the configured domain:

1. Click “Let’s get started” and the website's try-it button. Each should lead to sign-in.
2. Complete Google sign-in using a test account. Confirm the journey opens.
3. Sign out from **You → Sign out**. Complete email code sign-in, then repeat with a phone code.
4. Try an incorrect and expired code. No journey should open. Confirm resend, changing contact details and retry messages work.
5. While signed out, open `/journey/` directly. It should redirect to `/signin`; `/journey/content.json` and `/api/minzo-journey?file=content.json` should reject access.
6. Verify the account in Supabase Authentication → Users. If enabled, check `minzo_website_signins` too.
7. Confirm your existing mobile app can still sign in and its existing email links still work.

These production checks require your actual provider configuration. The delivered package has passed local handler tests and a production build, but no real Google, email or SMS sign-in was completed against your Supabase account.

## What is included and what is local

The complete package contains the redesigned landing page, original artwork, three sign-in methods, verified sessions, sign-out, and the existing interactive learning journey. The journey includes 20 learning checkpoints and companion encounters. Lesson progress remains stored **in this browser, separately for each verified account**. It does not sync lesson progress to the mobile app or another device.

Authentication is implemented with Supabase server calls and secure HttpOnly cookies. Visitors cannot unlock the journey with a localStorage flag. The protected HTML, lesson script and lesson content are served only after a Supabase user check. Artwork stays public for the homepage. Failed verification does not reveal protected files. Supabase manages user and session data; this package does not implement the mobile app's complete backend features.

A plain HTML upload cannot provide this server protection. Deploy the project folder as **Next.js**, including its server routes and configuration. Never publish only the `public` folder. [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
