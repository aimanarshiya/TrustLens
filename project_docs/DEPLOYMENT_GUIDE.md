# Deployment Guide

Updated: 2026-11-23

## Current status

The app builds locally, but it is not ready for public deployment. Firebase AI Logic and App Check are not configured end to end, no hosting target is selected, and no public endpoint has been deployed or tested.

## Required environment

Copy `.env.example` to `.env.local` for local development and provide the Firebase web app config, supported Gemini Developer API model, and reCAPTCHA v3 site key. These Vite values are public client configuration, not service-account secrets. Never place a reCAPTCHA secret, service-account key, App Check debug token, or other private credential in `VITE_` variables.

For local AI Logic testing, set `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN=true` in a development-only `.env.local`, restart Vite, and register the generated token in Firebase Console > App Check > the app's debug tokens. Do not use that debug build/token in a public deployment. Production requires a registered reCAPTCHA v3 app and allowed domain.

## Firebase Console steps

1. Confirm the existing Firebase web app and allowed domains.
2. In AI Logic, enable the Gemini Developer API backend and confirm the chosen model is available.
3. Confirm Firebase AI Logic App Check enforcement is enabled.
4. Register reCAPTCHA v3 for the production domain and configure the app's site key in deployment environment settings; keep the reCAPTCHA secret in Firebase Console.
5. Check App Check metrics and verify valid requests before public launch.
6. Use API/referrer restrictions and monitor the free-tier quota. Do not enable billing without explicit approval.

## Hosting gate

Choose Firebase Hosting or another compatible static host only after checking its current free-tier and project requirements. Do not run deploy or publish a URL without authorization for that external action. The production output is `dist/`; ensure SPA fallback, HTTPS, and restrictive security headers are configured by the host.
