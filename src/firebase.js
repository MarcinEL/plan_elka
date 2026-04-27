import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAhvcGClnTBDg2Kw3xxY_5xIDGp6x0QCzQ",
  authDomain: "plan-elka.firebaseapp.com",
  projectId: "plan-elka",
  storageBucket: "plan-elka.firebasestorage.app",
  messagingSenderId: "1060710596932",
  appId: "1:1060710596932:web:591f59c5291ba1962a9711",
  databaseURL: "https://plan-elka-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);
