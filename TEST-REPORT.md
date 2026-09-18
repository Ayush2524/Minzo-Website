# Validation — 18 September 2026

## Passed

- 24 automated authentication and route tests using Node's test runner. These cover configuration failure, rejecting admin keys, verified/anonymous/unconfirmed users, CSRF and origin checks, input/body validation, email and phone request parameters, CAPTCHA forwarding, rate limits, OTP verification, redirect restrictions, cookie handling, sign-out, private-file access, Next adapter behavior and config merging.
- The real Supabase SSR SDK generates an OAuth PKCE challenge and a secure HttpOnly verifier cookie. This check does not contact Google.
- The complete Next.js 16.3.5 website compiled and passed its production build on Node 24.19.0. The output tracing manifest includes all four private journey files and the homepage HTML needed by Vercel functions.
- The add-on installer was applied to a separate existing-Next-project fixture. Its homepage and custom Next headers were retained, the old public journey content was moved into a private backup, and the resulting project passed its production build.
- Browser check on the add-on fixture: the original “Let’s get started” link opens sign-in.
- Browser check on the complete production build: a homepage sample answer redirects a signed-out visitor to sign-in with the correct return destination. Direct journey navigation redirects to sign-in, and direct lesson content is unavailable when configuration is absent.
- Chrome desktop and 390px mobile sign-in layouts render correctly. The mobile page has no horizontal overflow. Desktop and mobile screenshots were saved separately.
- A localhost-only integration fixture with clearly labelled simulated email/SMS responses was used to exercise the real UI and handlers: email code screen, disabled resend countdown, wrong-code rejection, successful verification opening the journey, profile identity, sign-out and subsequent journey lockout. Phone country-code validation, SMS code screen and successful mobile journey transition also passed. The fixture is not part of either delivery package.

## Still requires the real account

Real Google consent and callback, real email/SMS delivery, provider billing/limits, production cookies on the live domain, optional acquisition SQL/RLS execution and the mobile app's compatibility checks were not run against the user's Supabase project. No Supabase credentials were available and no cloud settings or live deployments were changed.

The supplied preview correctly displays a setup-unavailable message until Supabase settings are provided. All mock providers and test bypasses are confined to automated tests or the unshipped local fixture. Production code has no test-login mode.

The existing Vercel repository itself was not available. The add-on was matched to the live site's observed Next.js structure and tested in a representative fixture; any custom middleware, TypeScript config or conflicting existing dependencies must be merged using its README.
