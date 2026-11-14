import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBImnFBMh8H0Kcwpk9HBXSYtAPCzZA3aKg",
  authDomain: "://firebaseapp.com",
  projectId: "fir-f4026",
  storageBucket: "fir-f4026.firebasestorage.app",
  messagingSenderId: "526088363765",
  appId: "1:526088363765:web:9a67f7ad819aafd5002fbc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
