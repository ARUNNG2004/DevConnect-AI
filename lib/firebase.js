import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Guard: only initialise Firebase in the browser.
// During Next.js SSR / Vercel static prerendering the env vars may not be
// present, which causes Firebase to throw auth/invalid-api-key and crash
// the build. All firebase-dependent code already runs inside "use client"
// components, so SSR initialisation is never needed.
const app =
  typeof window !== "undefined"
    ? !getApps().length
      ? initializeApp(firebaseConfig)
      : getApp()
    : null;

const auth = app ? getAuth(app) : null;
const db   = app ? getFirestore(app) : null;

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { app, auth, db, googleProvider, githubProvider };