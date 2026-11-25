# Test Strategy

Updated: 2026-11-23

## Automated checks

- `npm run test` executes deterministic engine, output-validation, and consent-routing tests with Node's built-in runner.
- `npx tsc -b` checks the TypeScript project.
- `npm run lint` checks source files.
- `npm run build` checks the production bundle.

## Test case categories

- URL parsing: ordinary URL is inconclusive; HTTP, IP address, brand mismatch, encoded hostname, unusual URL structure, invalid URL, and unsupported scheme.
- Message patterns: urgency, credentials, payment demand, secrecy, authority claim, and job-fee patterns.
- Risk semantics: no heuristic match never becomes a “safe” verdict; score and evidence are deterministic.
- AI validation: required fields, type/size constraints, invalid JSON, and invalid inference metadata.
- Privacy routing: without explicit consent use only-on-device; with per-check consent prefer on-device and allow cloud fallback.
- UI: manual browser verification of navigation, form submission, result display, privacy state, and empty states.

## Not yet covered

- Live Firebase AI Logic/App Check integration tests.
- Actual Gemini Nano inference on this machine.
- A cloud-fallback request or cloud quota/timeout test.
- Automated component/accessibility/browser tests.
- Labeled security dataset with precision, recall, false-positive, or false-negative measurements.
