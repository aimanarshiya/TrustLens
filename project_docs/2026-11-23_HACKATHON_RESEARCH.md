# #BuildHybridAI Official Requirements Research

Research date: 2026-11-23

## Official dates

- Submission period ends **November 30, 2026, at 2:00 p.m. Pacific Time**. At the project's Asia/Kolkata timezone this is **December 1, 2026, at 3:30 a.m. IST**.
- Judging is listed for December 10–16, 2026; winners are expected around December 21, 2026.
- The official rules state no purchase is necessary. They say required Firebase AI Logic and Gemini Nano 4 tools are usable through a free tier, but usage outside any provided quota may incur fees. This project therefore remains on the no-billing path.

## Requirements verified from official rules

- Build a generative AI app using Firebase AI Logic, including a supported platform. Web/Chrome must integrate Gemini Nano 4 via Firebase AI Logic.
- Firebase AI Logic requires App Check; debug tokens are accepted in submissions.
- Project must install/run consistently and match its submission description and video.
- Existing projects must be significantly updated during the submission period and disclose pre-existing work; a summary of work built during the submission period is required.
- The repository must be on GitHub or GitLab, publicly accessible, include source/assets/instructions, and contain an OSI open-source license. The runtime code must actually import and call Firebase AI Logic.
- The submission must include a project description explaining Firebase AI Logic use, features, and value proposition.
- A demo video is required, must show the project working, be no longer than three minutes, be public on YouTube, and be in English or include English subtitles.
- A hosted URL is strongly encouraged and must be available without restriction for judges if supplied.
- The judging criteria are equally weighted: technological implementation, design, potential impact, and quality of idea.
- Eligibility, Devpost account/team details, final submission form, and portal submission must be completed by the entrant.

## Official sources

- [#BuildHybridAI 2026 official rules and entry requirements](https://firebasehybridaihackathon.devpost.com/rules)
- [Firebase AI Logic hybrid inference for web](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [Firebase AI Logic hybrid configuration and inference-source reporting](https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options)
- [Firebase App Check reCAPTCHA v3 for web](https://firebase.google.com/docs/app-check/web/recaptcha-provider)
- [Firebase App Check debug provider for web](https://firebase.google.com/docs/app-check/web/debug-provider)
- [Firebase AI Logic security checklist](https://firebase.google.com/docs/ai-logic/security-checklist)
- [Chrome Prompt API availability and usage](https://developer.chrome.com/docs/ai/prompt-api)

## Technical facts from Firebase/Chrome documentation

- Firebase AI Logic web on-device support requires SDK v12.5.0+ and Chrome desktop 139+. On-device generation supports single-turn text generation, including structured JSON. Model download may be needed and requires user interaction.
- Firebase AI Logic exposes inference source on the response (`on_device` or `in_cloud`). The UI only displays that metadata.
- `PREFER_ON_DEVICE` can fall back to cloud. `ONLY_ON_DEVICE` must fail instead of sending to cloud. The project uses these modes to enforce consent.
- The Gemini Developer API is the official zero-cost starting backend; Agent Platform/Vertex AI has a billing requirement. App Check is automatically enforced during the Firebase AI Logic setup flow.
- Firebase documents the development debug switch as `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` before App Check initialization. Generated debug tokens must be kept private and registered in the Firebase console; `localhost` must not be added to reCAPTCHA allowed domains as a workaround.
- Production web App Check supports a real reCAPTCHA v3 or reCAPTCHA Enterprise provider. This implementation uses the supported reCAPTCHA v3 provider and fails closed when its site key is missing.

## Scope not yet verified

- Firebase Console state, backend enablement, quotas, App Check enforcement/registration, and reCAPTCHA domain settings.
- Eligibility/team status and Devpost form contents.
- Public repository, hosted app, demo video, or actual submission.
