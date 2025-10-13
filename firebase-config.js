// firebase-config.js
// This file initializes Firebase and exports auth, db, storage for other modules.
// Uses firebase v10.x CDN modules. Keep this file as a module.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your Firebase config (you provided this)
const firebaseConfig = {
  apiKey: "AIzaSyAEYagLFefMcmnOjbMGZLg2eNhCFDFXiwM",
  authDomain: "pusy-bali.firebaseapp.com",
  projectId: "pusy-bali",
  storageBucket: "pusy-bali.firebasestorage.app",
  messagingSenderId: "22279488877",
  appId: "1:22279488877:web:0519d5fbf37cc1eacc0664",
  measurementId: "G-NMN23YM78Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export objects for other modules
export { app, analytics, auth, db, storage };
