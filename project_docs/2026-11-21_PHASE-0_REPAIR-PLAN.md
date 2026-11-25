# TrustLens Phase 0 Minimal Repair Plan

Status: awaiting user approval

1. Repair dependency integrity using the existing lockfile; do not redesign the app or upgrade unrelated packages.
2. Rerun `npm run lint`, `npx tsc -b`, and `npm run build` to separate dependency corruption from source errors.
3. If source errors remain, make only minimal corrections to imports, types, and file responsibilities.
4. Establish a safe Firebase configuration boundary using Vite environment variable names and a non-secret `.env.example`; do not commit `.env.local` values.
5. Decide and implement only the supported App Check provider appropriate for this web app. Do not use `DebugProvider` or an undefined provider. Keep debug behavior development-only.
6. Remove or document only clearly unused template material/dependencies after verification; do not remove Firebase while it remains an intended product integration.
7. Start the Vite dev server and verify the root page renders in a browser. Record the exact command and observed result.
8. Save the implementation report, test results, and known issues; update `CURRENT_PROGRESS.md` with verified outcomes.

No repair should begin until this plan is approved.

