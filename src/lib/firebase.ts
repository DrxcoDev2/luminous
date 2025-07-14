
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase only if the API key is provided and no apps are initialized.
// This check prevents errors during the build process for static pages.
if (firebaseConfig.apiKey && !getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  // If an app is already initialized, get it. Otherwise, app remains undefined.
  app = getApps().length > 0 ? getApp() : (undefined as any);
}

// Only initialize auth and db if the app has been successfully initialized.
if (app) {
  auth = getAuth(app);
  db = getFirestore(app);
}

// Export the potentially uninitialized instances.
// Code that uses these must handle the case where they might be undefined,
// which is already done by the dynamic rendering logic on pages that need auth.
export { app, auth, db };
