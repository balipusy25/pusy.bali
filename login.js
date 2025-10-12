// ------------------------------
// USER SYSTEM
// ------------------------------
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ------------------------------
// SIGNUP
// ------------------------------
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = signupForm.name.value.trim();
        const email = signupForm.email.value.trim();
        const password = signupForm.password.value.trim();

        if (users.find(u => u.email === email)) {
            alert('Email already exists!');
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        alert('Signup successful! You are now logged in.');
        window.location.href = 'index.html';
    });
}

// ------------------------------
// LOGIN
// ------------------------------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.email.value.trim();
        const password = loginForm.password.value.trim();

        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            alert('Invalid email or password!');
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        alert(`Welcome back, ${user.name}!`);
        window.location.href = 'index.html';
    });
}

// ------------------------------
// LOGOUT FUNCTION
// ------------------------------
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateNavUser();
    alert('Logged out successfully.');
}

// ------------------------------
// NAV USER ICON UPDATE
// ------------------------------
function updateNavUser() {
    const navUserIcons = document.querySelectorAll('.fa-user');
    const current = JSON.parse(localStorage.getItem('currentUser'));
    navUserIcons.forEach(icon => {
        if (current) {
            icon.title = `Logged in as ${current.name}. Click to logout.`;
            icon.onclick = logout;
        } else {
            icon.title = 'Login / Sign Up';
            icon.onclick = () => window.location.href = 'login.html';
        }
    });
}

// ------------------------------
// INIT
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
    updateNavUser();
});
