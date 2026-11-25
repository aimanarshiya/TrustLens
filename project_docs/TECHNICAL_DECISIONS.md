# Technical Decisions

Updated: 2026-11-23

## DEC-001 — Rules own risk; AI explains

The deterministic engine produces risk level, score, and evidence. Gemini is restricted to a short explanation, recommendations, and uncertainty statements. The app validates the model response and never treats AI output as threat intelligence or as proof of safety.

## DEC-002 — Cloud analysis is opt-in per investigation

The default Firebase AI Logic mode is `ONLY_ON_DEVICE`. A checkbox must be enabled for an individual analysis to use `PREFER_ON_DEVICE` and permit Firebase cloud fallback. The choice resets when submitted. The UI identifies the actual inference source from Firebase response metadata.

## DEC-003 — No website fetches in the initial product

URLs are parsed locally. TrustLens does not follow redirects, load page scripts, or transmit a submitted URL to an external reputation service. SiteGuard explicitly reports that page content was not inspected.

## DEC-004 — No persistent content history

Recent check results remain in React state for the current tab only. User-submitted content itself is not retained in those entries.

## DEC-005 — Firebase/App Check fails closed

Firebase initialization is lazy and separate from React rendering. It requires complete Firebase environment configuration and a real reCAPTCHA v3 site key. The supported `ReCaptchaV3Provider` is the only configured production provider. A development-only App Check debug-token switch is opt-in; no `DebugProvider`, undefined provider, or invented key is used.

## DEC-006 — Existing lockfile preserved

No additional package was added for tests or product work. The test runner uses Node 24's built-in test runner and type stripping. `package-lock.json` has not been changed.

## DEC-007 — Plain React/CSS for the first coherent UI

The app uses existing React/Vite dependencies and local CSS. Additional UI libraries were avoided while disk space is limited and the project is still an MVP.
