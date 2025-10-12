// Import Firebase auth
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Initialize auth
const auth = getAuth();

// -------------------- CART --------------------
let cart = JSON.parse(localStorage.getItem('pusyBaliCart')) || [];
const cartCount = document.querySelectorAll('.cart-count');

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.forEach(el => el.textContent = total);
}
updateCartCount();

export function addToCart(product) {
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('pusyBaliCart', JSON.stringify(cart));
    updateCartCount();
    alert(`${product.name} added to cart!`);
}

// -------------------- PRODUCTS --------------------
const products = [
    { name:'Product 1', price:49.99, image:'assets/pic1.jpg', category:'tanks' },
    { name:'Product 2', price:59.99, image:'assets/pic2.jpg', category:'bottoms' },
    { name:'Product 3', price:39.99, image:'assets/pic3.jpg', category:'gym' },
    { name:'Product 4', price:29.99, image:'assets/pic4.jpg', category:'new' },
];

function renderProducts(containerId, filter='all') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    let filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p>$${p.price.toFixed(2)}</p>
            <button onclick="addToCart({name:'${p.name}', price:${p.price}, image:'${p.image}'})">Add to Cart</button>
        `;
        container.appendChild(card);
    });
}

// Render collection products
renderProducts('collection-grid-home');
renderProducts('collection-grid');

// Filter from URL (collections.html)
const params = new URLSearchParams(window.location.search);
if (params.has('filter')) {
    renderProducts('collection-grid', params.get('filter'));
}

// -------------------- SEARCH --------------------
const searchResults = document.getElementById('search-results');
if (searchResults) {
    const query = params.get('q')?.toLowerCase() || '';
    const results = products.filter(p => p.name.toLowerCase().includes(query));
    if (results.length === 0) searchResults.innerHTML = '<p>No results found</p>';
    else results.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `<img src="${p.image}" alt="${p.name}"><h4>${p.name}</h4><p>$${p.price}</p>`;
        searchResults.appendChild(div);
    });
}

// -------------------- AUTH --------------------
// Signup
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            alert('Signup successful!');
            window.location.href = 'index.html';
        })
        .catch(err => document.getElementById('signup-error').textContent = err.message);
    });
}

// Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            alert('Login successful!');
            window.location.href = 'index.html';
        })
        .catch(err => document.getElementById('login-error').textContent = err.message);
    });
}

// Google login/signup
const googleProvider = new GoogleAuthProvider();

const googleLoginBtn = document.getElementById('google-login');
if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
    .then(res => window.location.href='index.html')
    .catch(err => alert(err.message));
});
const googleSignupBtn = document.getElementById('google-signup');
if (googleSignupBtn) googleSignupBtn.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
    .then(res => window.location.href='index.html')
    .catch(err => alert(err.message));
});

// -------------------- CART PAGE RENDER --------------------
const cartItemsContainer = document.getElementById('cart-items');
if (cartItemsContainer) {
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<img src="${item.image}" alt="${item.name}" width="50">
                         <span>${item.name} x ${item.quantity}</span>
                         <span>$${(item.price * item.quantity).toFixed(2)}</span>`;
        cartItemsContainer.appendChild(div);
    });
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = cart.reduce((sum,item)=>sum+item.price*item.quantity,0).toFixed(2);
}
