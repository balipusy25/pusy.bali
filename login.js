/* login.js
   - Front-end simulated Google/Facebook login
   - Persists user name in localStorage
   - Hides login buttons and shows greeting when logged
*/

document.addEventListener('DOMContentLoaded', () => {
  const USER_KEY = 'puysUser';
  let user = JSON.parse(localStorage.getItem(USER_KEY)) || null;

  // If your header used different IDs just make sure to match them
  const googleBtn = document.getElementById('google-login');
  const facebookBtn = document.getElementById('facebook-login');
  const userNameSpan = document.getElementById('user-name');

  function updateUI() {
    const icons = document.querySelectorAll('.cart-icon');
    if (user) {
      if (userNameSpan) userNameSpan.innerText = `Hello, ${user.name}`;
      if (googleBtn) googleBtn.style.display = 'none';
      if (facebookBtn) facebookBtn.style.display = 'none';
    } else {
      if (userNameSpan) userNameSpan.innerText = '';
      if (googleBtn) googleBtn.style.display = 'inline-block';
      if (facebookBtn) facebookBtn.style.display = 'inline-block';
    }
    // ensure cart count visible if script.js loaded
    if (window.Puys && typeof window.Puys.updateCartCountUI === 'function') window.Puys.updateCartCountUI();
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      // simulation: prompt for a name
      const name = prompt('Simulated Google login: Enter display name') || 'GoogleUser';
      user = { provider: 'google', name };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      updateUI();
    });
  }

  if (facebookBtn) {
    facebookBtn.addEventListener('click', () => {
      const name = prompt('Simulated Facebook login: Enter display name') || 'FacebookUser';
      user = { provider: 'facebook', name };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      updateUI();
    });
  }

  // optional sign-out when clicking the greeting
  if (userNameSpan) {
    userNameSpan.addEventListener('click', () => {
      if (!user) return;
      if (confirm('Sign out?')) {
        user = null;
        localStorage.removeItem(USER_KEY);
        updateUI();
      }
    });
  }

  updateUI();
});
