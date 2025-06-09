// lib/firebase/firebase-admin-config.js
import admin from "firebase-admin";

// This path should point to your downloaded service account key JSON file
// It's best to store this file securely and not in your public repo.
// For production, you might load the credentials from environment variables directly.
const serviceAccount = require("./suchana-key.json"); // Adjust path

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const messaging = admin.messaging();
export { admin, messaging };
