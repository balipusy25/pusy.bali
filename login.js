// login.js
// Must be included with type="module" on pages that use it.
// It uses firebase-config.js exports.

import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  // Signup form (id="signup-form")
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = signupForm.querySelector('input[name="name"]').value.trim();
      const email = signupForm.querySelector('input[name="email"]').value.trim();
      const password = signupForm.querySelector('input[name="password"]').value;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        // optionally store displayName in user profile or Firestore (not included here)
        alert('Account created and signed in as ' + email);
        window.location.href = 'index.html';
      } catch (err) {
        console.error(err);
        alert('Error creating user: ' + (err.message || err));
      }
    });
  }

  // Login form (id="login-form")
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('input[name="email"]').value.trim();
      const password = loginForm.querySelector('input[name="password"]').value;
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        alert('Signed in as ' + email);
        window.location.href = 'index.html';
      } catch (err) {
        console.error(err);
        alert('Login failed: ' + (err.message || err));
      }
    });
  }

  // Optional sign out button (data-signout="true")
  document.querySelectorAll('[data-signout="true"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await signOut(auth);
      alert('Signed out');
      window.location.reload();
    });
  });
});
