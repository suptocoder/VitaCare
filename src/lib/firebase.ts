// lib/firebase.ts - COMPLETE REPLACEMENT
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQbBd1hnaIMdoDRrKNcEe4W_ontH91MNU",
  authDomain: "vitacare-v3.firebaseapp.com",
  projectId: "vitacare-v3",
  storageBucket: "vitacare-v3.firebasestorage.app",
  messagingSenderId: "784796711395",
  appId: "1:784796711395:web:b110dd6453fbcb328448d6",
  measurementId: "G-6Y69PDWZNH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// 🔧 TESTING MODE for Development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Method 1: Disable app verification for testing
  if (auth.settings) {
    auth.settings.appVerificationDisabledForTesting = true;
  }

  // Method 2: Alternative approach
  (auth as any).settings = {
    appVerificationDisabledForTesting: true,
  };

  console.log("🔧 Development testing mode enabled");
  console.log("🔧 App verification disabled for localhost testing");
}

export default app;
