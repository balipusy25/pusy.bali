// firebase-config.js
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Your web app's Firebase configuration
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
export const auth = getAuth(app);
