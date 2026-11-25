# TrustLens Phase 0 Test Results

Date: 2026-11-23

## Dependency recovery

- `npm ci`: passed; 270 packages added from the existing lockfile.
- `package-lock.json` SHA-256 before and after install: unchanged (`9FA912B0146CF363C92048C826EECE52BA8040234E1DF73C676F0AF680A7C10C`).
- `npm ls --depth=0`: passed; declared top-level packages resolve.
- `npm audit --omit=dev`: reports four high severity audit findings; see `KNOWN_ISSUES.md`. No audit fix was applied.
- npm reported install scripts for `@firebase/util` and `protobufjs` were not approved. No feature exercising those packages was tested.

## Required checks

- `npm run lint`: passed with no reported findings.
- `npx tsc -b`: passed with no diagnostics.
- `npm run build`: passed. Vite 8.3.8 produced the production bundle.

## Browser verification

- Started `npm run dev -- --host 127.0.0.1` and opened `http://127.0.0.1:5173/` in the integrated browser.
- Observed page title `TrustLens - Progressive Hybrid AI Security` and rendered text `Welcome to TrustLens`, `Progressive Hybrid AI Security`, and `Your application is running successfully.`

## Limitations

- No automated test script or test suite is configured.
- Firebase AI is not called by the rendered page; App Check is not configured.
