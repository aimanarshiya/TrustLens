
# TRUSTLENS — PROJECT RULES

## Product Goal
Build TrustLens, a progressive hybrid AI digital security
platform designed to detect phishing, scams, malicious
websites, payment fraud and identity impersonation.

## Core Modules
1. LinkGuard
2. MessageGuard
3. SiteGuard
4. PayGuard
5. IdentityGuard

## Architecture
- React + TypeScript frontend.
- Chrome Extension using Manifest V3.
- Firebase AI Logic for cloud AI.
- Chrome Prompt API / Gemini Nano for supported
  on-device inference.
- Shared threat investigation engine.
- Deterministic security checks alongside AI.
- Privacy-first data handling.
- Cloud escalation only when appropriate and permitted.

## Engineering Rules
1. Inspect the existing code before changing it.
2. Never overwrite working features without justification.
3. Never invent API responses or claim integrations work
   without testing them.
4. Never hardcode private credentials.
5. Never expose sensitive user information.
6. Never declare a URL or payment safe based on AI alone.
7. Return structured, validated JSON from AI services.
8. Add error handling and loading states.
9. Use reusable components and typed interfaces.
10. Avoid unnecessary dependencies.

## Development Workflow
For every phase:
1. Inspect.
2. Prepare an implementation plan.
3. Identify affected files.
4. Implement.
5. Run lint and type checks.
6. Run relevant tests.
7. Review security implications.
8. Report completed and incomplete work.

## Documentation Requirements
Create and maintain project_docs/.

Save:
- Architecture decisions.
- Investigation reports.
- Implementation reports.
- Security audits.
- Test results.
- Code review findings.
- Known issues.
- Phase completion reports.

Update CURRENT_PROGRESS.md after every phase.
Preserve dated reports instead of overwriting history.

Never claim unverified work is complete.

## Cost Constraints
- No paid services without explicit approval.
- No billing account activation without approval.
- Check free-tier quotas before cloud requests.
- Do not purchase hardware.
- Prefer free and open-source tools.
