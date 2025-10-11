/* ==========================
   MAIN.JS — PUSY BALI SHOP
   ========================== */

// ------------------------------
// GLOBAL UTILITIES
// ------------------------------
function $(sel, ctx = document) {
  return ctx.querySelector(sel);
}
function $$(sel, ctx = document) {
  return ctx.querySelectorAll(sel);
}

// Save & Load from localStorage
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function load(key, def = null) {
  const v = localStorage.getItem(key);
  if (!v) return def;
  try {
    return JSON.parse(v);
  } catch {
    return def;
  }
}

// ------------------------------
// CART FUNCTIONS
// ------------------------------
function loadCart() {
  return load("cart", []);
}

function saveCart(cart) {
  save("cart", cart);
  updateCartCount();
}

function clearCart() {
  saveCart([]);
}

function addToCart(item) {
  const cart = loadCart();
  const existing = cart.find((c) => c.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart(cart);
  alert("Added to cart!");
}

function removeFromCart(id) {
  const cart = loadCart().filter((c) => c.id !== id);
  saveCart(cart);
}

function cartTotal() {
  const cart = loadCart();
  return cart.reduce((t, c) => t + c.price * c.qty, 0).toFixed(2);
}

function updateCartCount() {
  const cart = loadCart();
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const el = $("#cart-count");
  if (el) el.textContent = count;
  localStorage.setItem("cartTotal", cartTotal());
}

// ------------------------------
// RENDER CART PAGE
// ------------------------------
function renderCartPage() {
  const cartContainer = $("#cart-items");
  if (!cartContainer) return;

  const cart = loadCart();
  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartContainer.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.img}" alt="">
      <div class="cart-details">
        <h4>${item.name}</h4>
        <p>$${item.price}</p>
        <div class="cart-controls">
          <span>Qty: ${item.qty}</span>
          <button onclick="removeFromCart(${item.id});renderCartPage();">Remove</button>
        </div>
      </div>
    </div>`
    )
    .join("");

  $("#cart-total").textContent = cartTotal();
}

// ------------------------------
// RENDER CHECKOUT PAGE
// ------------------------------
function renderCheckoutPage() {
  const checkoutItems = $("#checkout-items");
  if (!checkoutItems) return;

  const cart = loadCart();
  if (cart.length === 0) {
    checkoutItems.innerHTML = "<p>Your cart is empty.</p>";
    $("#order-total").textContent = "0.00";
    return;
  }

  checkoutItems.innerHTML = cart
    .map(
      (i) => `
    <div class="checkout-item">
      <img src="${i.img}" alt="">
      <div>
        <p>${i.name}</p>
        <p>$${i.price} × ${i.qty}</p>
      </div>
    </div>`
    )
    .join("");

  const total = cartTotal();
  $("#order-items-count").textContent = cart.length;
  $("#order-subtotal").textContent = total;
  $("#order-total").textContent = total;
}

// ------------------------------
// USER AUTH (FAKE + SOCIAL LOGIN)
// ------------------------------
function getCurrentUser() {
  return load("user", null);
}

function saveUser(user) {
  save("user", user);
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// Dummy Google & Facebook login placeholders
function googleLogin() {
  const user = {
    name: "Google User",
    email: "googleuser@example.com",
    provider: "Google",
  };
  saveUser(user);
  window.location.href = "profile.html";
}

function facebookLogin() {
  const user = {
    name: "Facebook User",
    email: "facebookuser@example.com",
    provider: "Facebook",
  };
  saveUser(user);
  window.location.href = "profile.html";
}

// Traditional form signup/login
function handleLoginForm() {
  const form = $("#login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    if (!email || !password) return alert("Enter email and password");
    const user = { email, name: email.split("@")[0], provider: "local" };
    saveUser(user);
    window.location.href = "profile.html";
  });
}

// ------------------------------
// PROFILE PAGE
// ------------------------------
function renderProfilePage() {
  const root = $("#profile-root");
  if (!root) return;
  const user = getCurrentUser();
  if (!user) {
    root.innerHTML = `
      <p>You are not logged in.</p>
      <a href="login.html" class="btn">Login</a>
    `;
    return;
  }

  const orders = load(`orders_${user.email}`, []);
  root.innerHTML = `
    <h2>Welcome, ${user.name}</h2>
    <p>Provider: ${user.provider}</p>
    <h3>Your Orders</h3>
    <div class="order-list">
      ${
        orders.length
          ? orders
              .map(
                (o) => `
        <div class="order-card">
          <h4>Order #${o.id}</h4>
          <p>Total: $${o.total}</p>
          <p>Date: ${new Date(o.createdAt).toLocaleString()}</p>
        </div>`
              )
              .join("")
          : "<p>No orders yet.</p>"
      }
    </div>
    <button onclick="logout()" class="btn">Logout</button>
  `;
}

// ------------------------------
// LOCAL DEMO ORDER STORAGE
// ------------------------------
function saveOrderForDemo(email, order) {
  const key = `orders_${email}`;
  const orders = load(key, []);
  orders.push(order);
  save(key, orders);
}

// ------------------------------
// CHECKOUT FINALIZATION
// ------------------------------
function finalizeOrderDemo(paypalDetails) {
  try {
    const cart = loadCart();
    const total = cartTotal();
    const user = getCurrentUser() || { email: "guest@example.com", name: "Guest" };
    const orderId = "OD" + Date.now();
    const order = {
      id: orderId,
      items: cart,
      total,
      createdAt: new Date().toISOString(),
      payer: paypalDetails?.payer || null,
    };

    // Save to local profile
    saveOrderForDemo(user.email, order);

    // Optional backend notification
    fetch("/api/record-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "paypal", order, paypalDetails }),
    }).catch((err) => console.warn("backend notify failed", err));

    clearCart();
    window.location.href = "success.html";
  } catch (err) {
    console.error("finalizeOrderDemo", err);
    clearCart();
    window.location.href = "success.html";
  }
}

// ------------------------------
// SEARCH PANEL LOGIC
// ------------------------------
function initSearchPanel() {
  const searchIcon = $("#search-icon");
  const panel = $("#search-panel");
  const closeBtn = $("#close-search");

  if (searchIcon && panel && closeBtn) {
    searchIcon.addEventListener("click", () => (panel.style.display = "flex"));
    closeBtn.addEventListener("click", () => (panel.style.display = "none"));
  }
}

// ------------------------------
// ON PAGE LOAD
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  initSearchPanel();
  renderCartPage();
  renderCheckoutPage();
  renderProfilePage();
  handleLoginForm();
});
