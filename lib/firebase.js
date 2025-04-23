// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD52DUnNtL-OaJz7xldXF3NZw6GH5-LKTw",
  authDomain: "aichatbot-174cf.firebaseapp.com",
  projectId: "aichatbot-174cf",
  storageBucket: "aichatbot-174cf.firebasestorage.app",
  messagingSenderId: "522742946375",
  appId: "1:522742946375:web:26422f7024a692b10d2f62",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
