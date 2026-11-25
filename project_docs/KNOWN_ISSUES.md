# TrustLens Known Issues

Updated: 2026-11-23 after Firebase integration attempt.

## Open issues

- Firebase App Check token acquisition fails during localhost tests. The reCAPTCHA/App Check flow returned 400 on `localhost`; an earlier Firebase AI Logic request was rejected with 401 because the App Check token was invalid. The configured reCAPTCHA key's domain allowlist and Firebase console App Check app association cannot be inspected from this workspace.
- Firebase guidance recommends a registered App Check debug token for localhost and warns against adding localhost to a production reCAPTCHA key. The current local environment has not been changed to debug mode, and no debug token was captured or exposed.
- No successful Gemini generation response was received. The UI correctly retained deterministic findings and showed no AI content.
- The Firebase Console state (AI Logic provider enabled, App Check enforcement/metrics, App Check app registration, and quotas) is not verifiable from the local project.
- Hybrid on-device inference and consent-based cloud fallback have not been validated. Firebase SDK hybrid settings are nested correctly now, but implementation/verification is intentionally pending a successful cloud request.
- SiteGuard, PayGuard, and IdentityGuard remain workflows over shared basic URL/text checks; specialized detection is not implemented.
- Heuristic risk scoring is not calibrated, does not query threat intelligence, and is not a probability or safety guarantee.
- `npm audit --omit=dev` previously reported four high severity findings in the Firebase Firestore/gRPC dependency path. No automatic dependency fix was applied; `package-lock.json` remains unchanged.
- `npm ci` previously reported that install scripts for `@firebase/util` and `protobufjs` were not approved under the current npm policy.
- About 756 MiB was free on C: at the latest check. Re-check disk before any dependency reinstall.
- Apache-2.0 license attribution should be confirmed by the project owner before public release.

## Resolved

- React type declaration corruption was repaired from the existing lockfile; lockfile hash is recorded in the MVP report.
- Firebase configuration is environment-based; initialization remains separate from React rendering.
- App Check uses the supported `ReCaptchaV3Provider`; no undefined provider or `DebugProvider` is used.
- AI errors are mapped to safe actionable categories; raw Firebase error detail is not displayed.
- Deterministic risk evidence remains visible when App Check or AI fails.
- Lint, TypeScript, nine deterministic tests, and production build passed after the latest integration code changes.
