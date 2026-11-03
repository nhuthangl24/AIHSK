import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

export function getFirebaseConfig(): FirebaseClientConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAb5rRFMel32xjSyix5MCZFFCumV6PfvBc",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hsks-a320f.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hsks-a320f",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hsks-a320f.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "408971964413",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:408971964413:web:9afccbcaf6392b4b96b394",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-FCRGDPQY27",
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
export const googleAuthProvider = new GoogleAuthProvider();

export function getFirebaseServices(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  isConfigured: boolean;
} {
  if (typeof window === "undefined") {
    return { app: null, auth: null, isConfigured: false };
  }

  try {
    const config = getFirebaseConfig();
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    return { app, auth, isConfigured: true };
  } catch (err) {
    console.warn("Firebase client initialization error:", err);
    return { app: null, auth: null, isConfigured: false };
  }
}
