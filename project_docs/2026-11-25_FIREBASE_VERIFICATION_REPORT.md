# Firebase Verification Report

Date: 2026-11-25

## Scope

This pass rechecked the existing Firebase AI Logic integration against the locally configured environment. Secret values, App Check tokens, and private credentials were not printed, logged, or included in this report.

## Results

- Firebase configuration variables were present in `.env.local`.
- Firebase SDK version is `13.4.0`.
- The app lazily initializes Firebase, App Check with `ReCaptchaV3Provider`, and Firebase AI Logic. Cloud model parameters remain under `inCloudParams`, and the installed SDK supports the configured hybrid modes.
- App Check token acquisition was attempted from `http://localhost:5173/` using the configured reCAPTCHA v3 provider.
- The browser received HTTP 400 from the reCAPTCHA endpoint. Firebase reported `appCheck/initial-throttle`; `getToken(appCheck)` did not return a usable token.
- The configured App Check debug-token mode is disabled. No debug token was generated, displayed, or exposed.
- Because App Check failed, no actual Gemini generation request was accepted and no AI response was displayed. The UI retained the deterministic result and showed a sanitized App Check error.
- Localhost authorization cannot be confirmed from source code or this workspace. It requires Firebase Console/reCAPTCHA key configuration or an authorized HTTPS test host. No Console changes were made.
- Billing was not enabled and no paid service was used.

## Security and behavior

- The deterministic risk engine remains the source of the risk score and finding level.
- AI output is rendered only after a real Firebase response passes JSON validation and reports `inferenceSource` as `on_device` or `in_cloud`.
- No fabricated AI response, token, site secret, raw credential, or full provider error was exposed.
- Quota, timeout, model, App Check, and network failures continue to map to safe user-facing messages.
- Genuine on-device inference and cloud fallback remain unverified. They must not be claimed until a real response is observed.

## Validation

- `npm run lint` — passed.
- `npx tsc -b` — passed.
- `npm test` — passed, 9/9 deterministic tests.
- `npm run build` — passed.

## Blocker and next action

The remaining blocker is external App Check authorization/token acceptance, not the local application code. Configure the reCAPTCHA v3 key for the exact test origin or use Firebase's documented private debug-token workflow for local development, without committing or sharing the token. Re-run token acquisition and one cloud generation request after that change. Stop if Firebase requires billing or a paid service.
