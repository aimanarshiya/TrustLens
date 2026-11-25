import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getToken, initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from "firebase/app-check";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  type GenerativeModel,
} from "firebase/ai";
import { explanationJsonSchema } from "../security/model-output.ts";
import { inferencePreference } from "../ai/routing.ts";

const requiredFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} satisfies FirebaseOptions;

interface FirebaseServices {
  appCheck: AppCheck;
  model: (allowCloudFallback: boolean) => GenerativeModel;
}

let services: FirebaseServices | undefined;

function requireConfig(name: string, value: string): string {
  if (!value || value.startsWith("your-")) {
    throw new Error(`Firebase setup is incomplete: configure ${name} in .env.local.`);
  }
  return value;
}

function initializeFirebaseServices(): FirebaseServices {
  if (services) return services;

  const config: FirebaseOptions = {
    apiKey: requireConfig("VITE_FIREBASE_API_KEY", requiredFirebaseConfig.apiKey ?? ""),
    authDomain: requireConfig("VITE_FIREBASE_AUTH_DOMAIN", requiredFirebaseConfig.authDomain ?? ""),
    projectId: requireConfig("VITE_FIREBASE_PROJECT_ID", requiredFirebaseConfig.projectId ?? ""),
    storageBucket: requireConfig("VITE_FIREBASE_STORAGE_BUCKET", requiredFirebaseConfig.storageBucket ?? ""),
    messagingSenderId: requireConfig("VITE_FIREBASE_MESSAGING_SENDER_ID", requiredFirebaseConfig.messagingSenderId ?? ""),
    appId: requireConfig("VITE_FIREBASE_APP_ID", requiredFirebaseConfig.appId ?? ""),
  };
  const siteKey = requireConfig(
    "VITE_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY",
    import.meta.env.VITE_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY,
  );
  const modelName = requireConfig("VITE_FIREBASE_AI_MODEL", import.meta.env.VITE_FIREBASE_AI_MODEL);

  const app = getApps().find((candidate) => candidate.name === "trustlens")
    ?? initializeApp(config, "trustlens");

  if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN === "true") {
    Object.assign(window, { FIREBASE_APPCHECK_DEBUG_TOKEN: true });
  }

  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });

  const ai = getAI(app, { backend: new GoogleAIBackend() });
  services = {
    model: (allowCloudFallback) => getGenerativeModel(ai, {
      mode: inferencePreference(allowCloudFallback),
      inCloudParams: {
        model: modelName,
        generationConfig: {
          maxOutputTokens: 512,
          responseMimeType: "application/json",
          responseJsonSchema: explanationJsonSchema,
        },
      },
    }),
    appCheck,
  };
  return services;
}

export function getTrustLensModel(allowCloudFallback: boolean): GenerativeModel {
  return initializeFirebaseServices().model(allowCloudFallback);
}

export async function verifyTrustLensAppCheckToken(): Promise<void> {
  const { appCheck } = initializeFirebaseServices();
  const tokenResult = await getToken(appCheck);
  if (!tokenResult.token.trim()) {
    throw new Error("Firebase App Check did not provide a token.");
  }
}
