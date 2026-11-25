# TrustLens Product MVP Test Results

Date: 2026-11-23

## Automated checks (rerun 2026-11-23 after docs and MVP updates)

- `npm run lint`: passed (exit 0).
- `npx tsc -b`: passed (exit 0).
- `npm run test`: passed, 9/9 deterministic/security-routing/model-output tests (exit 0).
- `npm run build`: passed (exit 0); Vite produced the production bundle.

## Browser checks

- Opened local Vite app in the integrated browser. Overview displays all five module entry points and an honest zero-activity state.
- Opened LinkGuard and submitted `https://paypal.com.evil.example/sign-in`. It displayed the brand-domain mismatch and sensitive-path signals, a rule-derived score of 42/100, and non-safe language.
- The same browser run showed AI unavailable because `VITE_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY` is missing in `.env.local`. No Firebase AI request or fabricated explanation occurred.
- Chrome Prompt API availability was `downloadable`; the model was not locally available for actual inference.
- Latest browser snapshot still shows all five modules, session-only results, on-device model status, Firebase setup needed, and cloud consent required.

## Lockfile and package changes

- Added a `test` script using Node 24's built-in test runner and type stripping. No dependencies were added and `package-lock.json` was not changed.
- All Firebase model, App Check, and model-name configuration remains in environment variables.

## Not verified

- A live Firebase AI Logic request, App Check token acceptance, Gemini Nano generation, cloud fallback, offline behavior, model latency, accuracy/precision/recall, deployment, extension, or public submission.
