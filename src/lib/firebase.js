import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyACW625Ucn8Iolp-AAF1SKtsu0Gv1TjwQE",
  authDomain: "unicorn-erp.firebaseapp.com",
  projectId: "unicorn-erp",
  storageBucket: "unicorn-erp.firebasestorage.app",
  messagingSenderId: "91866871718",
  appId: "1:91866871718:web:63712d8b8f104057c98167"
};

// Initialize Firebase App (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Create a secondary app instance for creating users from the admin panel 
// without logging out the currently logged-in Admin.
export const secondaryApp = !getApps().some(a => a.name === "Secondary") 
  ? initializeApp(firebaseConfig, "Secondary") 
  : getApp("Secondary");
export const secondaryAuth = getAuth(secondaryApp);

export default app;
