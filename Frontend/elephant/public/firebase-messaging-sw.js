// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js"
);

// Your web app's Firebase configuration
// You generally need to hardcode these public values here
// as service workers don't have direct access to process.env
firebase.initializeApp({
  apiKey: "AIzaSyCs_1kExx4cs-sACIoOIIoGHAVmyiipr7k",
  authDomain: "suchana-f5c80.firebaseapp.com",
  projectId: "suchana-f5c80",
  storageBucket: "suchana-f5c80.firebasestorage.app",
  messagingSenderId: "50194215452",
  appId: "1:50194215452:web:4213e02834e3db0ef725d9",
  measurementId: "G-3KF624D45F",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("SW: Received background message: ", payload);
  console.log("SW: Notification Title:", payload.notification.title);
  console.log("SW: Notification Body:", payload.notification.body);
  console.log("SW: Notification Data (from payload):", payload.data); // Confirmed in your screenshot

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/favicon.ico",
    // THIS IS THE CRUCIAL LINE FOR PASSING DATA TO THE CLICK HANDLER:
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  console.log("SW: Notification Clicked! (This log should appear)"); // <-- Look for this!
  event.notification.close();

  const clickedNotification = event.notification;
  console.log("SW: Clicked Notification Object:", clickedNotification); // <-- Look for this!
  console.log(
    "SW: Clicked Notification Data (from event.notification):",
    clickedNotification.data
  ); // <-- LOOK AT THIS ONE CLOSELY!
  const urlToOpen = clickedNotification.data && clickedNotification.data.url;
  console.log("SW: URL to Open (extracted from click data):", urlToOpen); // <-- LOOK AT THIS ONE CLOSELY!

  if (urlToOpen) {
    console.log("SW: Attempting to open window to:", urlToOpen); // <-- Look for this!
    event.waitUntil(clients.openWindow(urlToOpen));
  } else {
    console.warn(
      "SW: No URL found in notification data on click. Opening root URL."
    );
    event.waitUntil(clients.openWindow("/"));
  }
});

// Optional: Add skipWaiting and clients.claim for aggressive updates during development
self.addEventListener("install", (event) => {
  console.log("SW: Install event triggered. Skipping waiting...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activate event triggered. Claiming clients...");
  event.waitUntil(clients.claim());
});
