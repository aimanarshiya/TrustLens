# TrustLens Phase 0 Technical Audit

Date: 2026-11-21  
Scope: `trustlens-web` existing project, read-only audit before repair approval

## Executive summary

The repository is a minimal Vite React application. ESLint passes, but the production build is currently blocked by a corrupted installed dependency: `node_modules/@types/react/index.d.ts` contains the application `main.tsx` source rather than React type declarations. Firebase initialization is present in `src/firebase/firebase.ts` but is not imported by the React entry point, so the Firebase AI objects are not initialized during the current app render. The Firebase API shape used there is compatible with the installed Firebase package, but App Check is not configured at all.

No application source was changed during this audit. The only additions are these audit documents.

## Prioritized findings

### P0 — Build/type-check blocker: corrupted installed React declarations

`npm run build` fails in `node_modules/@types/react/index.d.ts` with `TS1005` and `TS1161`. The file is 245 bytes and contains the project’s `src/main.tsx` JSX entry code, not the published React declaration file. This is an installed-dependency/worktree integrity problem, not a TypeScript error in `App.tsx`.

Impact: `tsc -b` stops before Vite bundles the application. The build cannot currently be certified.

Recommended repair: restore dependencies from the lockfile using a clean, approved dependency installation, then rerun type-check/build. Preserve and inspect the lockfile before changing dependency versions.

### P1 — Firebase configuration is hardcoded and not connected to the app

`src/firebase/firebase.ts` contains a literal Firebase web configuration, including an API key, and exports `ai` and `cloudModel`. No source file imports this module, so initialization is currently dead/unreferenced. Firebase web API keys are not secret credentials by themselves, but hardcoding environment-specific configuration makes deployment separation and rotation difficult; security depends on Firebase restrictions and backend rules.

Impact: Firebase AI is not available to the rendered application, and the current environment file has no usable assignments.

Recommended repair: move configuration to Vite environment variables with a documented `.env.example`, validate required values, and import the Firebase module only from the future feature boundary that needs it. Do not expose or copy secret values into reports.

### P1 — App Check is absent; debug-token declaration is misleading/incomplete

`src/vite-env.d.ts` declares `window.FIREBASE_APPCHECK_DEBUG_TOKEN`, but no `initializeAppCheck` call or provider exists. The declaration alone does not enable App Check. No unsupported `DebugProvider` import was found in the repository. The installed Firebase package exposes supported providers such as `ReCaptchaV3Provider`, `ReCaptchaEnterpriseProvider`, and `CustomProvider`; provider selection requires an explicit product/environment decision.

Impact: Firebase AI requests do not receive App Check protection from this code. Adding a guessed provider or undefined debug provider would create a runtime/build failure.

Recommended repair: after approval, choose the supported web provider and initialize App Check before Firebase services that depend on it. Keep debug-token behavior development-only and avoid shipping a fixed debug token.

### P2 — Environment file is present but unusable

`.env.local` exists and is ignored by Git, but its eight lines contain no detectable `KEY=value` assignments. No `import.meta.env` references exist in source. Therefore no environment variables are currently consumed or configured.

Impact: environment-specific Firebase configuration cannot work through the current project code.

### P2 — Firebase module responsibility is premature/isolated

`src/firebase/firebase.ts` initializes Firebase AI at module evaluation time and exports a model singleton, while no caller uses it. There is no error boundary, initialization validation, or request layer. This is not yet a duplicate-export issue, but it is a broken responsibility boundary for a production integration.

### P2 — Verification coverage is absent

No test files or test script are present. `package.json` provides `dev`, `build`, `lint`, and `preview` only. Runtime browser rendering has not been certified in this pre-approval audit.

### P3 — Dependency/configuration observations

- Direct runtime dependencies are `react`, `react-dom`, and `firebase`; Firebase is currently unused by the rendered app.
- `App.tsx` is a simple render-only component and has no current TypeScript/ESLint findings.
- `main.tsx` uses a non-null assertion for `#root`; the matching element exists in `index.html`, so this is currently safe but not defensive.
- `App.css` contains template CSS but is not imported by `App.tsx`; this is unused project material, not a build error.
- `tsconfig` uses strict unused checks and modern bundler settings. The configured TypeScript 6.0.3 is compatible in principle with the declared React types, but the installed declaration file is corrupt.
- No duplicate exports, missing local modules, or incorrect local imports were found by static inspection. The Firebase module is simply unreferenced.

## Required files reviewed

Reviewed: `App.tsx`, `main.tsx`, `vite-env.d.ts`, `src/firebase/firebase.ts`, `index.html`, `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `eslint.config.js`, `README.md`, `.gitignore`, both CSS files, public assets, `.env.local` structure, and the installed top-level dependency tree.

## Commands and evidence

- `npm run lint` — completed with exit code 0 and no reported findings.
- `npm run build` — failed with exit code 1 during `tsc -b`:
  - `node_modules/@types/react/index.d.ts(11,10): error TS1005: '>' expected.`
  - `node_modules/@types/react/index.d.ts(12,4): error TS1161: Unterminated regular expression literal.`
- `npm ls --depth=0` — dependency tree resolves without an npm missing/invalid marker; installed versions include `firebase@13.4.0`, `react@19.3.1`, `@types/react@19.3.0`, `typescript@6.0.3`, and `vite@8.3.8`.
- Static search excluding dependencies — found only the Firebase module and the App Check window declaration; no environment-variable consumption or App Check initialization.

## Security notes

The Firebase web API key was intentionally not reproduced in this report. It should still be treated as configuration rather than a server secret, protected with Firebase API restrictions, authorized domains, App Check, and backend security rules. No credential values from `.env.local` were printed.

