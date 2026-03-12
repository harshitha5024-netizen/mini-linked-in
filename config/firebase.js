/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin for server-side authentication verification
 */
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin with service account
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/serviceAccountKey.json';

try {
  const serviceAccount = require(path.resolve(serviceAccountPath));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase Admin initialization failed. Using mock auth for development.');
  console.warn('   Place your serviceAccountKey.json in the config/ folder.');
  // Initialize with a default app for development
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

module.exports = admin;
