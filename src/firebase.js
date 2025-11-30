// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⬇️ Replace these values with your own firebaseConfig from the console
const firebaseConfig = {
  apiKey: "AIzaSyDs1XQ6LVKbKdRUp7ieR3vJ60Ehr80gJBE",
  authDomain: "panel-smac.firebaseapp.com",
  projectId: "panel-smac",
  storageBucket: "panel-smac.firebasestorage.app",
  messagingSenderId: "864037705592",
  appId: "1:864037705592:web:6c75a0753e3ad553681a8d",
  measurementId: "G-G4CXX3GVDJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
