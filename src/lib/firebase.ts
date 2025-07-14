// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDX_iPbiSkMO4_IEEtCH803Bqjnc73MNvM",
  authDomain: "luminous-bc20e.firebaseapp.com",
  projectId: "luminous-bc20e",
  storageBucket: "luminous-bc20e.firebasestorage.app",
  messagingSenderId: "646540049073",
  appId: "1:646540049073:web:d47618ceda640c855d0090",
  measurementId: "G-8XEP767JLM"

};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
