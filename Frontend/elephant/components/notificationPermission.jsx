// components/NotificationPermission.jsx (or .tsx)
"use client"; // If using Next.js App Router

import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "lib/firebase-cm";

// Get your VAPID public key from Firebase Console -> Project settings -> Cloud Messaging -> Web Push certificates
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

const NotificationPermission = () => {
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    const requestPermission = async () => {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        console.warn(
          "Notifications or Service Workers not supported in this browser."
        );
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");

          // Get the FCM token
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          setFcmToken(token);
          console.log("FCM Token:", token);

          // Send this token to your backend to store it,
          // so you can send targeted notifications later.
          // Example: await fetch('/api/save-fcm-token', { method: 'POST', body: JSON.stringify({ token }) });

          // Handle foreground messages
          onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
            // You can display a custom in-app notification here
            // e.g., using a toast library or a custom UI element
            alert(
              `New Message: ${payload.notification.title} - ${payload.notification.body}`
            );
          });
        } else if (permission === "denied") {
          console.warn("Notification permission denied.");
        } else {
          console.log("Notification permission dismissed.");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    requestPermission();
  }, []);

  return (
    <div>
      {fcmToken ? (
        <p>FCM Token: {fcmToken}</p>
      ) : (
        <p>Requesting notification permission...</p>
      )}
    </div>
  );
};

export default NotificationPermission;