// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

// vapid: BC26Flm4KXe8N3g4JxjiueMU5PThsXl-Jt8YiylxxIHQpuYZBzTVH0NgUJUVG3afidwany_A7aFl6X92Wr8Uw4U
