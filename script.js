// ------------------ Firebase Auth ------------------
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const auth = window.auth;
const provider = window.googleProvider;

// Signup form
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
      window.location.href = "index.html";
    } catch (error) {
      document.getElementById("signup-error").textContent = error.message;
    }
  });

  document.getElementById("google-signup").addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("Signed in with Google!");
      window.location.href = "index.html";
    } catch (error) {
      document.getElementById("signup-error").textContent = error.message;
    }
  });
}

// Login form
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
      window.location.href = "index.html";
    } catch (error) {
      document.getElementById("login-error").textContent = error.message;
    }
  });

  document.getElementById("google-login").addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("Logged in with Google!");
      window.location.href = "index.html";
    } catch (error) {
      document.getElementById("login-error").textContent = error.message;
    }
  });
}

// ------------------ Cart Functionality ------------------
let cart = JSON.parse(localStorage.getItem("pusyCart")) || [];

function updateCartCount() {
  document.querySelectorAll(".cart-count").forEach(el => el.textContent = cart.length);
}

window.addToCart = function(product) {
  cart.push(product);
  localStorage.setItem("pusyCart", JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} added to cart!`);
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;
  container.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h4>${item.name}</h4>
      <p>$${item.price.toFixed(2)}</p>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;
    container.appendChild(div);
    total += item.price;
  });
  document.getElementById("cart-total").textContent = total.toFixed(2);
  updateCartCount();
}

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  localStorage.setItem("pusyCart", JSON.stringify(cart));
  renderCart();
}

renderCart();

// ------------------ Collection Page Filtering ------------------
const collectionGrid = document.getElementById("collection-grid");
if (collectionGrid) {
  const products = [
    {name:"Product 1",price:49.99,image:"assets/pic1.jpg",category:"tanks"},
    {name:"Product 2",price:59.99,image:"assets/pic2.jpg",category:"bottoms"},
    {name:"Product 3",price:39.99,image:"assets/pic3.jpg",category:"gym"},
    {name:"Product 4",price:29.99,image:"assets/pic4.jpg",category:"new"}
  ];

  const categoryFilter = document.getElementById("filter-category");
  const sortSelect = document.getElementById("sort-products");

  function renderProducts() {
    let filtered = products;
    if (categoryFilter && categoryFilter.value !== "all") {
      filtered = products.filter(p => p.category === categoryFilter.value);
    }

    if (sortSelect) {
      if (sortSelect.value === "price-low") filtered.sort((a,b)=>a.price-b.price);
      if (sortSelect.value === "price-high") filtered.sort((a,b)=>b.price-a.price);
    }

    collectionGrid.innerHTML = "";
    filtered.forEach(p => {
      const div = document.createElement("div");
      div.classList.add("product-card");
      div.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>$${p.price.toFixed(2)}</p>
        <button onclick="addToCart({name:'${p.name}',price:${p.price},image:'${p.image}'})">Add to Cart</button>
      `;
      collectionGrid.appendChild(div);
    });
  }

  if (categoryFilter) categoryFilter.addEventListener("change", renderProducts);
  if (sortSelect) sortSelect.addEventListener("change", renderProducts);

  renderProducts();
}
