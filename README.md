# TrustLens

TrustLens is a privacy-minded security investigation MVP for suspicious links and messages. It combines transparent local heuristics with an optional Firebase AI Logic explanation path. A heuristic result is a triage aid, not a guarantee that content is safe or malicious.

## Current scope

- LinkGuard investigates a URL without visiting it.
- MessageGuard analyzes pasted message text.
- SiteGuard, PayGuard, and IdentityGuard are workflow entry points backed by the shared investigation engine; their specialized detection is not yet implemented.
- Evidence and risk scoring are deterministic and remain separate from generated explanations.
- AI analysis requires an explicit action. Cloud fallback is separately opted into for each investigation. Raw inputs are not persisted by the app.
- The web build does not include a Chrome extension or a threat-intelligence feed.

## Requirements

- Node.js 24 or later (the test script uses Node's built-in TypeScript stripping).
- npm and a current Chrome desktop browser for the optional Prompt API path.

## Local setup

1. Copy `.env.example` to `.env.local` and fill the Firebase web app configuration, a Firebase AI Logic model identifier, and a reCAPTCHA v3 site key.
2. In Firebase Console, enable Firebase AI Logic and configure App Check for the web app. App Check enforcement and API availability must be verified in that project. Do not put a reCAPTCHA secret or debug token in client environment variables.
3. Run `npm ci`, then `npm run dev`.
4. Use LinkGuard or MessageGuard, review the deterministic evidence, and explicitly press the AI analysis action. Cloud fallback is off by default.

For local development, use the documented opt-in App Check debug-token flow and register the generated token privately in Firebase Console. Firebase advises against adding `localhost` to a production reCAPTCHA key. Never commit or share the generated token, and do not ship a debug build. Do not enable paid billing or a paid quota without explicit project-owner approval.

## Checks

```sh
npm run lint
npx tsc -b
npm run test
npm run build
```

## Privacy and limitations

URL investigation parses the provided string locally and does not navigate to it or query reputation services. Message analysis uses local rules first. If AI is explicitly requested, the input is sent through Firebase AI Logic; with cloud fallback enabled, Firebase's hybrid mode may send content to the cloud when on-device inference is unavailable. The UI displays the reported inference source when provided by the SDK.

Heuristics can miss attacks and produce false alarms. A low score or no detected signals is inconclusive, not a safety verdict. This MVP does not inspect page contents, validate payment recipients, perform identity verification, or replace security review. Never paste passwords, payment credentials, or highly sensitive personal data.

See `project_docs/` for architecture, decisions, threat model, test results, known issues, deployment notes, and hackathon readiness.
