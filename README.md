# TrustLens — Progressive Hybrid AI Security

**A privacy-conscious security platform designed to help users identify suspicious links, messages, websites, payment requests, and identity impersonation attempts.**

## Overview

TrustLens is a cybersecurity project built around a shared threat investigation engine. It combines deterministic security checks with a planned hybrid AI architecture to provide explainable security assessments.

The project currently focuses on its deterministic MVP foundation. Firebase AI Logic cloud inference and on-device inference remain under integration and verification.

## Security Modules

TrustLens is organized into five modules:

| Module | Purpose |
|---|---|
| LinkGuard | Investigates suspicious URLs and links |
| MessageGuard | Analyzes suspicious messages, phishing emails, and job offers |
| SiteGuard | Helps identify suspicious websites and brand impersonation |
| PayGuard | Examines suspicious payment requests |
| IdentityGuard | Investigates potential identity impersonation and social engineering |

These modules use a shared investigation approach rather than five independent security engines.

## Key Features Implemented

- React-based application interface.
- Five security module entry points.
- Shared deterministic security investigation engine.
- Explainable security assessment foundation.
- Local automated tests for deterministic logic.
- Project documentation and implementation tracking.

## Technology Stack

- React
- TypeScript
- Vite
- Firebase
- Firebase AI Logic (integration in progress)
- Chrome Prompt API / Gemini Nano (planned on-device inference)

## Hybrid AI Architecture — Planned

The intended architecture consists of:

1. **Deterministic security layer:** Performs local security checks.
2. **On-device AI:** Uses supported browser-based inference when available.
3. **Cloud AI:** Uses Firebase AI Logic for cloud-based analysis.
4. **Fallback and routing:** Selects an available inference path while respecting user privacy.
5. **Explainability:** Presents supporting indicators and recommendations.

The complete hybrid inference pipeline has not yet been verified.

## Current Project Status

### Completed and locally verified

- React application foundation.
- Five module entry points.
- Shared deterministic security engine.
- Nine deterministic tests passed in the latest reported test run.
- ESLint checks passed.
- TypeScript checks passed.
- Production build passed.

### In progress / blocked

- Firebase App Check configuration and token acquisition.
- Verified Gemini cloud inference.
- Verified Chrome on-device inference.
- End-to-end hybrid routing.
- Production deployment and public demo.

**Important:** Passing deterministic tests does not establish AI detection accuracy or prove that cloud and on-device inference work.

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

```bash
git clone YOUR_REPOSITORY_URL
cd trustlens-web
npm install
```

### Environment Configuration

Create a local `.env.local` file using the required Firebase configuration variables.

Never commit `.env.local` or private credentials.

### Run the Development Server

```bash
npm run dev
```

Open the localhost URL displayed by Vite.

### Run Checks

```bash
npm run lint
npx tsc -b
npm test
npm run build
```

## Project Documentation

Implementation history, audit reports, testing results, decisions, known issues, and progress records are maintained in:

```text
project_docs/
```

See `project_docs/CURRENT_PROGRESS.md` for the latest project status.

## Security and Privacy Principles

- Treat external links and messages as untrusted input.
- Never represent an unverified website or transaction as guaranteed safe.
- Do not allow AI analysis to authorize payments or transactions.
- Protect credentials and private configuration.
- Preserve deterministic security checks when AI services are unavailable.

## Current Limitations

TrustLens is an actively developed prototype, not a production-certified security product. AI-powered detection, hybrid inference, and real-world detection accuracy require further implementation and testing.

## License

To be selected before public release.