// server/config/firebaseAdmin.js
const admin = require("firebase-admin");

// IMPORTANT: Set this environment variable in your deployment environment.
// For local development, you can set it in your .env file or directly point to the path.
// e.g., GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/firebase-service-account-key.json"
// Ensure the service account JSON file is NOT committed to your repository if public.
try {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON
  ) {
    // For environments like Google Cloud Run, Vercel, etc., where you can set the JSON content as an env var
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log(
      "Firebase Admin SDK initialized with JSON from environment variable."
    );
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Standard way, using the path specified in GOOGLE_APPLICATION_CREDENTIALS
    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // Reads from GOOGLE_APPLICATION_CREDENTIALS
    });
    console.log(
      "Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS."
    );
  } else {
    // Fallback for local development if GOOGLE_APPLICATION_CREDENTIALS is not set globally
    // Ensure 'firebase-service-account-key.json' is in a 'config' directory at the root of 'server'
    // and this 'config' directory is in .gitignore
    const serviceAccount = require("./firebase-service-account-key.json"); // Adjust path as needed
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log(
      "Firebase Admin SDK initialized with local service account file."
    );
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error.message);
  console.error("Ensure your service account key is correctly configured.");
  // process.exit(1); // Optionally exit if Firebase is critical
}

let bucket;
try {
  // Make sure to enable Firebase Storage in your Firebase console
  // and set the bucket name in your .env file
  // e.g., FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
  if (process.env.FIREBASE_STORAGE_BUCKET) {
    bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
    console.log(`bucket: ${process.env.FIREBASE_STORAGE_BUCKET}`);
    console.log("Firebase Storage bucket initialized.");
  } else {
    console.warn(
      "FIREBASE_STORAGE_BUCKET environment variable not set. File uploads will be disabled."
    );
  }
} catch (error) {
  console.error("Firebase Storage initialization error:", error.message);
}

const db = admin.firestore();

module.exports = { admin, db, bucket };
