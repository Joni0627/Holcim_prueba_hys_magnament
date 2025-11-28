import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwQHhUd8D2xmbSOzo0XLx2AdH6DbIdvHw",
  authDomain: "hs-management-4cfed.firebaseapp.com",
  projectId: "hs-management-4cfed",
  storageBucket: "hs-management-4cfed.firebasestorage.app",
  messagingSenderId: "695226263796",
  appId: "1:695226263796:web:6e8c4ce7c0e14e761516a1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);