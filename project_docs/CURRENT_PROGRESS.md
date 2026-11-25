# TrustLens Current Progress

Updated: 2026-11-25

## MVP implementation

The web MVP includes the five module entry points, local deterministic investigation, structured AI explanation handling, explicit per-check cloud consent, and session-only result summaries. Phase 0 recovery and product implementation reports are preserved.

## Firebase integration — blocked at App Check verification

Completed this pass:

- Confirmed all expected Firebase environment entries are present in `.env.local` without displaying their values. The configured model name is supported by current Firebase AI Logic documentation.
- Confirmed Firebase initializes lazily outside React rendering, constructs `ReCaptchaV3Provider` with the configured site key, and initializes App Check before Firebase AI Logic.
- Added an explicit App Check token preflight using Firebase's `getToken`; the token is checked only for non-empty content and is never logged or displayed.
- Corrected hybrid SDK configuration so cloud generation settings are nested under `inCloudParams`, as required by the installed Firebase SDK. Removed raw Firebase error display and added safe handling for App Check, quota, timeout, network, and model errors.
- Tried the browser integration on both `127.0.0.1` and `localhost`. The reCAPTCHA/App Check token was not accepted. One Firebase AI Logic request was rejected with HTTP 401 for an invalid App Check token; after adding the explicit preflight, localhost token acquisition failed with HTTP 400 before any generation request. No AI response was returned or shown.
- Kept the deterministic result visible and independent from AI. No hybrid inference success is claimed.
- `npm run lint`, `npx tsc -b`, `npm run test` (9/9), and `npm run build` passed after the code changes.

Firebase’s current guidance treats localhost as an invalid App Check environment and recommends the documented debug-token flow for local development. It specifically warns against adding localhost to a production reCAPTCHA key. Therefore localhost authorization with this configured reCAPTCHA provider is not confirmed, and the integration cannot proceed until App Check is set up for local development or tested on an authorized hosted domain. See `2026-11-23_FIREBASE_INTEGRATION_REPORT.md`.

## Next

- For local testing, register a Firebase App Check debug token privately, or provide an authorized HTTPS test hostname with its reCAPTCHA v3 key configured. Do not send debug tokens or private credentials in chat.
- Then verify a valid App Check token, one real Gemini response displayed in the UI, and quota/network error behavior. Do not enable billing.
- Only after cloud inference succeeds, implement and verify actual Firebase AI Logic on-device inference and consent-based cloud fallback using the official SDK modes and response source metadata.

## 2026-11-25 verification

- Rechecked the local environment and live localhost flow with the configured reCAPTCHA v3 site key. Firebase/App Check initialization is present, but reCAPTCHA returned HTTP 400 and `getToken(appCheck)` did not produce a usable token.
- The App Check debug-token mode is disabled. No token or secret was exposed, and no App Check bypass was added.
- No Gemini response was returned, so the UI correctly displayed only the deterministic result and a sanitized App Check failure. Cloud generation, on-device inference, and hybrid fallback remain unverified.
- Validation passed: lint, TypeScript build, 9/9 deterministic tests, and production build.
- See `2026-11-25_FIREBASE_VERIFICATION_REPORT.md` for evidence and the required external configuration step.

See `KNOWN_ISSUES.md` and dated reports for test evidence, recovery details, and unresolved limitations.
