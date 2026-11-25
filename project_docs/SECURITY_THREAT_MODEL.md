# TrustLens Security Threat Model

Date: 2026-11-23

## Assets

- User-submitted suspicious messages and URLs.
- Firebase project/API configuration and App Check registration.
- The integrity and availability of investigation results.
- The user's ability to distinguish a heuristic from a verified verdict.

## Actors and abuse cases

- A scammer crafts URLs or messages to trigger false reassurance or false alarms.
- A malicious message contains prompt injection intended to manipulate the explanation.
- A user pastes personal information into an analysis field.
- An attacker attempts to abuse client-side Firebase AI Logic or exfiltrate a project key.
- A malicious URL attempts to trigger a fetch, redirect, script, or unsafe rendering path.
- A model returns malformed, overconfident, or hostile text.

## Trust boundaries

- All user content is untrusted input.
- The model is an untrusted suggestion source, not a security authority.
- Firebase AI Logic is a third-party cloud boundary and receives content only after per-check consent and successful App Check configuration.
- The React result UI renders submitted/model strings as text and does not interpret HTML.
- No TrustLens backend or persistent user-content store currently exists.

## Mitigations in the current MVP

- URL parsing is local; the app does not navigate to or fetch the supplied URL.
- Deterministic signals and risk scoring do not depend on model output.
- A zero-signal result is labeled inconclusive; no result declares a site/payment safe.
- Cloud fallback is off by default and resets after a check.
- Model prompts label content as untrusted data and request only constrained JSON.
- Runtime validation rejects non-JSON, missing fields, wrong types, and oversized model text.
- React text rendering escapes strings; no `dangerouslySetInnerHTML` is used.
- Firebase setup requires a supported App Check provider key and fails closed when missing.
- No fixed App Check debug token is included. Debug mode is development-only and opt-in.
- Recent results are held in memory without original submitted content.

## Residual risks and limitations

- Prompt injection can still influence a generative model; the model output must remain advisory.
- Heuristics can miss novel scams and can flag benign content. No calibrated precision/recall claims are available.
- Firebase web API configuration values are visible in a browser bundle by design; restrict the API key by referrer/API and protect Firebase services with App Check.
- App Check enforcement and provider registration have not been verified in the Firebase console; AI calls have not yet succeeded.
- No CSP/security headers are configured for a production host.
- No independent penetration test, threat-feed check, or browser security review has been performed.
- Repeated cloud requests could consume quota. The app currently has no per-account quota or backend rate limit.
