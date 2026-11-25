# Firebase Integration Report

Date: 2026-11-23

## Configuration review

- All expected `VITE_FIREBASE_*` entries were present in `.env.local`. Values were checked privately and are intentionally not reproduced in this report.
- The configured model name is `gemini-3.5-flash-lite`, the Firebase AI Logic cloud fallback model documented by Firebase JS SDK 13.
- Firebase initialization stays lazy and separate from React rendering.
- The app constructs `ReCaptchaV3Provider` from the configured site key and initializes App Check before Firebase AI Logic.
- Added an explicit `getToken(appCheck)` preflight. It rejects an empty token and never returns, logs, or displays token contents.
- Updated hybrid generation configuration to place cloud model and generation settings inside `inCloudParams`; the installed SDK had warned that top-level `generationConfig` is ignored in hybrid mode.
- AI failure text is sanitized into App Check, quota, timeout, network, model-name, and general setup categories. No credentials or full Firebase error payload are shown.

## Browser checks

- Browser origin `http://127.0.0.1:5173/`: App Check/reCAPTCHA failed, then Firebase AI Logic rejected the generation request with HTTP 401 and an invalid App Check token. No model response was returned.
- Browser origin `http://localhost:5173/`: explicit App Check token preflight returned HTTP 400. The generation request was not sent. The UI displayed a safe App Check setup message and retained the deterministic investigation result.
- No AI explanation was fabricated or rendered. The test prompt contained no personal or sensitive data.
- The UI reports environment presence as unverified and preserves the deterministic finding; it does not label Firebase as working.
- Localhost authorization in the reCAPTCHA key configuration cannot be confirmed from this workspace. No Firebase Console changes were made.

Firebase's official App Check guidance says localhost is not a valid App Check environment for production attestation, recommends the debug-token workflow for local development, and warns against adding localhost to a production reCAPTCHA key. So we should use a private registered debug token for local development or validate the reCAPTCHA provider on an authorized HTTPS test domain.

## Verification

- `npm run lint`: passed.
- `npx tsc -b`: passed.
- `npm run test`: passed, 9/9.
- `npm run build`: passed.
- `package-lock.json` was not modified. No new package was installed and billing was not enabled.

## Blocked / next steps

- Verify App Check console registration, enforcement metrics, and no-cost quota state; these require Firebase Console access.
- To test locally, register an App Check debug token privately. Never commit or send that token. Alternatively, provide an authorized HTTPS test host and matching reCAPTCHA v3 configuration.
- After valid token acquisition, make one real Gemini generation request and verify that the actual response appears in the UI.
- Only after cloud generation succeeds, implement and verify on-device inference and cloud fallback using Firebase AI Logic's official hybrid modes. Do not claim hybrid behavior before observing `inferenceSource` from a real response.
- Stop if the console requires enabling billing or paid service usage; no billing action was taken.

## Official references

- Firebase AI Logic hybrid web guide: https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
- Firebase AI Logic hybrid configuration: https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options
- Firebase App Check reCAPTCHA v3: https://firebase.google.com/docs/app-check/web/recaptcha-provider
- Firebase App Check debug token for web: https://firebase.google.com/docs/app-check/web/debug-provider
- Firebase supported models: https://firebase.google.com/docs/ai-logic/models
