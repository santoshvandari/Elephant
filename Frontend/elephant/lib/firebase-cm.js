// lib/firebase/firebase-config.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCs_1kExx4cs-sACIoOIIoGHAVmyiipr7k",
  authDomain: "suchana-f5c80.firebaseapp.com",
  projectId: "suchana-f5c80",
  storageBucket: "suchana-f5c80.firebasestorage.app",
  messagingSenderId: "50194215452",
  appId: "1:50194215452:web:4213e02834e3db0ef725d9",
  measurementId: "G-3KF624D45F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging;
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

export { app, messaging };
