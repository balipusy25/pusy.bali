// login.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#loginForm');
  const signupForm = document.querySelector('#signupForm');

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = e.target.name.value;
      const email = e.target.email.value;
      const password = e.target.password.value;

      const newUser = { name, email, password };
      localStorage.setItem('user', JSON.stringify(newUser));
      alert('Account created successfully!');
      window.location.href = 'index.html';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      const savedUser = JSON.parse(localStorage.getItem('user'));

      if (savedUser && savedUser.email === email && savedUser.password === password) {
        alert('Login successful!');
        window.location.href = 'index.html';
      } else {
        alert('Invalid credentials.');
      }
    });
  }
});
