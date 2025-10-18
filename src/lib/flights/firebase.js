// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:"AIzaSyCp3_gzbFvr3txl9o3GMyFpBV3zYhvGpQU",
  authDomain: "skywatch-alerts-f6115.firebaseapp.com",
  projectId: "skywatch-alerts-f6115",
  storageBucket: "skywatch-alerts-f6115.firebasestorage.app",
  messagingSenderId:  "298776258581",
  appId: "1:298776258581:web:0e14bc2df5bd12b6ce861c",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };