/**
 * Firebase Client Configuration
 * Initializes Firebase for client-side authentication
 * 
 * IMPORTANT: Replace these values with your actual Firebase project config
 */

// Firebase configuration object
// Get these values from: Firebase Console > Project Settings > Web App
const firebaseConfig = {
  apiKey: "AIzaSyA8sIABQpHTowgfbS93fqGJY6WyCsuslE4",
  authDomain: "minilinkedin-e8366.firebaseapp.com",
  projectId: "minilinkedin-e8366",
  storageBucket: "minilinkedin-e8366.firebasestorage.app",
  messagingSenderId: "997426610000",
  appId: "1:997426610000:web:360a7f1211d5f94dad3655",
  measurementId: "G-045S3PSRXC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

console.log('🔥 Firebase initialized');
