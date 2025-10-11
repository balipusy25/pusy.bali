/* main.js — Full site logic
   - Works across pages: index.html, collections.html, cart.html, checkout.html,
     login.html, profile.html, success.html
   - Uses localStorage for cart and front-end user accounts (demo).
*/

/* ===========================
   Utilities & Data
   =========================== */

// Simple products dataset (placeholder images). Add or edit entries here.
const PRODUCTS = [
  { id: 1, name: "Linen Tank", price: 29.99, category: "tanks", img: "assets/pic1.jpg", createdAt: "2025-10-01" },
  { id: 2, name: "High Waist Bottoms", price: 49.99, category: "bottoms", img: "assets/pic2.jpg", createdAt: "2025-09-15" },
  { id: 3, name: "Minimal Tee", price: 24.99, category: "new", img: "assets/pic3.jpg", createdAt: "2025-10-05" },
  { id: 4, name: "Silk Scarf", price: 19.99, category: "accessories", img: "assets/pic4.jpg", createdAt: "2025-08-22" },
  { id: 5, name: "Relaxed Shorts", price: 34.99, category: "bottoms", img: "assets/pic5.jpg", createdAt: "2025-07-30" },
  { id: 6, name: "Cropped Tank", price: 27.99, category: "tanks", img: "assets/pic6.jpg", createdAt: "2025-10-03" },
  { id: 7, name: "Signature Dress", price: 79.99, category: "new", img: "assets/pic7.jpg", createdAt: "2025-09-01" },
  { id: 8, name: "Everyday Belt", price: 14.99, category: "accessories", img: "assets/pic8.jpg", createdAt: "2025-06-18" },
  // add more items as needed; images reference assets/picX.jpg
];

// LocalStorage keys
const KEY_CART = "pusy_cart_v1";
const KEY_USERS = "pusy_users_v1";
const KEY_CURRENT_USER = "pusy_current_user_v1";
const KEY_SELECTED_CATEGORY = "pusy_selected_category_v1";

/* ===========================
   Cart Helpers
   =========================== */

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY_CART)) || [];
  } catch {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(KEY_CART, JSON.stringify(cart));
}
function clearCart() {
  saveCart([]);
  updateCartCount();
}

/* returns cart item {productId, qty, priceSnapshot, name} */
function addToCartById(productId, qty = 1) {
  const product = PRODUCTS.find(p => p.id === +productId);
  if (!product) return;
  const cart = loadCart();
  // if item exists, increase qty
  const existing = cart.find(i => i.productId === product.id);
  if (existing) existing.qty = existing.qty + qty;
  else cart.push({ productId: product.id, qty: qty, price: product.price, name: product.name, img: product.img });
  saveCart(cart);
  updateCartCount();
}

/* remove or update */
function removeFromCartByIndex(index) {
  const cart = loadCart();
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    saveCart(cart);
    updateCartCount();
  }
}
function updateQtyInCart(index, qty) {
  const cart = loadCart();
  if (index >= 0 && index < cart.length) {
    cart[index].qty = Math.max(1, Math.floor(qty));
    saveCart(cart);
    updateCartCount();
  }
}
function cartTotal() {
  const cart = loadCart();
  let total = 0;
  for (let i = 0; i < cart.length; ++i) {
    // compute digit-by-digit style safe arithmetic
    const a = Math.round(cart[i].price * 100);
    const b = Math.round(cart[i].qty);
    total += a * b;
  }
  return (total / 100).toFixed(2);
}
function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) el.textContent = loadCart().reduce((s, i) => s + (i.qty || 0), 0);
}

/* ===========================
   Product Rendering
   =========================== */

function createProductCard(product) {
  const div = document.createElement("div");
  div.className = "product-card";
  div.innerHTML = `
    <img src="${product.img}" alt="${escapeHtml(product.name)}">
    <p class="product-name">${escapeHtml(product.name)}</p>
    <p class="product-price">$${(+product.price).toFixed(2)}</p>
    <div class="product-actions">
      <button class="add-cart-btn" data-id="${product.id}">Add to Cart</button>
    </div>
  `;
  return div;
}

function escapeHtml(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* render homepage featured / new products */
function renderHomeProducts() {
  const area = document.getElementById("new-products");
  if (!area) return;
  area.innerHTML = "";
  // Show newest 8 by createdAt
  const sorted = PRODUCTS.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  const list = sorted.slice(0, 8);
  list.forEach(p => {
    const card = createProductCard(p);
    area.appendChild(card);
  });
  attachAddToCartButtons(area);
}

/* render collections page with optional filters and sorting */
function renderCollectionGrid() {
  const grid = document.getElementById("collection-grid");
  if (!grid) return;
  grid.innerHTML = "";
  // read filters
  const categoryFilter = document.getElementById("category-filter");
  const sortFilter = document.getElementById("sort-filter");
  const selectedCategory = (categoryFilter && categoryFilter.value) || localStorage.getItem(KEY_SELECTED_CATEGORY) || "all";
  const sortBy = (sortFilter && sortFilter.value) || "newest";

  // filter
  let list = PRODUCTS.slice();
  if (selectedCategory && selectedCategory !== "all") {
    list = list.filter(p => p.category === selectedCategory);
  }

  // sort
  if (sortBy === "newest") list.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortBy === "price-asc") list.sort((a,b)=> a.price - b.price);
  else if (sortBy === "price-desc") list.sort((a,b)=> b.price - a.price);

  // populate
  list.forEach(p => grid.appendChild(createProductCard(p)));
  attachAddToCartButtons(grid);
}

/* attach click handlers for add to cart buttons in a container */
function attachAddToCartButtons(container) {
  container.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      addToCartById(id, 1);
      // small visual feedback
      btn.textContent = "Added ✓";
      setTimeout(()=> btn.textContent = "Add to Cart", 900);
    });
  });
}

/* ===========================
   Collections / Category quick-links
   =========================== */

function initCategoryQuickLinks() {
  const cats = document.querySelectorAll(".category");
  cats.forEach(c => {
    c.addEventListener("click", () => {
      const cat = c.dataset.cat || c.getAttribute("data-cat");
      if (cat) {
        localStorage.setItem(KEY_SELECTED_CATEGORY, cat);
        window.location.href = "collections.html";
      }
    });
  });
}

/* ===========================
   Search Panel
   =========================== */

function initSearchPanel() {
  const searchIcon = document.getElementById("search-icon");
  const searchPanel = document.getElementById("search-panel");
  const closeBtn = document.getElementById("close-search");
  const searchInput = document.getElementById("search-input");

  if (searchIcon && searchPanel) {
    searchIcon.addEventListener("click", ()=> {
      searchPanel.style.display = "block";
      if (searchInput) { searchInput.focus(); }
    });
  }
  if (closeBtn && searchPanel) {
    closeBtn.addEventListener("click", ()=> searchPanel.style.display = "none");
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.trim().toLowerCase();
      // on collections page filter product cards
      const cards = document.querySelectorAll(".product-card");
      cards.forEach(card => {
        const name = (card.querySelector(".product-name")?.textContent || "").toLowerCase();
        card.style.display = name.includes(term) ? "" : "none";
      });
    });
  }
}

/* ===========================
   Cart Page & Checkout Rendering
   =========================== */

function renderCartPage() {
  const cartDiv = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!cartDiv) return;
  cartDiv.innerHTML = "";
  const cart = loadCart();
  if (cart.length === 0) {
    cartDiv.innerHTML = "<p>Your cart is empty.</p>";
    if (totalEl) totalEl.textContent = "0.00";
    return;
  }
  cart.forEach((item, idx) => {
    const p = PRODUCTS.find(p => p.id === item.productId) || {};
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.img || p.img || 'assets/pic1.jpg'}" alt="${escapeHtml(item.name)}">
      <div class="cart-item-info">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-price">$${(+item.price).toFixed(2)}</div>
      </div>
      <input class="cart-qty" type="number" min="1" value="${item.qty}">
      <div class="cart-item-actions">
        <button class="cart-remove-btn">Remove</button>
      </div>
    `;
    // qty change
    row.querySelector(".cart-qty").addEventListener("change", (e) => {
      const val = Math.max(1, Math.floor(Number(e.target.value) || 1));
      updateQtyInCart(idx, val);
      renderCartPage(); // re-render to keep things consistent
    });
    // remove
    row.querySelector(".cart-remove-btn").addEventListener("click", ()=> {
      removeFromCartByIndex(idx);
      renderCartPage();
    });
    cartDiv.appendChild(row);
  });

  if (totalEl) totalEl.textContent = cartTotal();
}

/* Checkout-specific rendering: list items + shipping form total */
function renderCheckoutPage() {
  const checkoutItems = document.getElementById("checkout-items");
  const checkoutTotalAmount = document.getElementById("checkout-total-amount");
  if (!checkoutItems || !checkoutTotalAmount) return;
  checkoutItems.innerHTML = "";
  const cart = loadCart();
  if (cart.length === 0) {
    checkoutItems.innerHTML = "<p>Your cart is empty.</p>";
    checkoutTotalAmount.textContent = "0.00";
    return;
  }
  let total = 0;
  cart.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="checkout-left">
        <img src="${item.img}" alt="${escapeHtml(item.name)}">
        <div>
          <div class="product-name">${escapeHtml(item.name)}</div>
          <div class="product-price">$${(+item.price).toFixed(2)}</div>
        </div>
      </div>
      <div class="checkout-right">
        <input type="number" class="qty-input" min="1" value="${item.qty}">
        <button class="remove-btn">Remove</button>
      </div>
    `;
    // qty change
    row.querySelector(".qty-input").addEventListener("change", (e) => {
      const newQty = Math.max(1, Math.floor(Number(e.target.value) || 1));
      updateQtyInCart(idx, newQty);
      renderCheckoutPage();
      renderCartPage();
    });
    // remove
    row.querySelector(".remove-btn").addEventListener("click", () => {
      removeFromCartByIndex(idx);
      renderCheckoutPage();
      renderCartPage();
    });
    checkoutItems.appendChild(row);
    total += Math.round(item.price * 100) * item.qty;
  });
  const display = (total/100).toFixed(2);
  checkoutTotalAmount.textContent = display;
  // store for PayPal usage
  localStorage.setItem("cartTotal", display);
}

/* ===========================
   Login / Signup / Profile (localStorage demo)
   =========================== */

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(KEY_USERS)) || []; } catch { return []; }
}
function saveUsers(users) { localStorage.setItem(KEY_USERS, JSON.stringify(users)); }
function setCurrentUser(userObj) { localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(userObj)); }
function getCurrentUser() { try { return JSON.parse(localStorage.getItem(KEY_CURRENT_USER)); } catch { return null; } }
function logoutUser() { localStorage.removeItem(KEY_CURRENT_USER); location.href = "index.html"; }

function initAuthForms() {
  // login
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const oauthGoogle = document.querySelectorAll(".oauth-google");
  const oauthFacebook = document.querySelectorAll(".oauth-facebook");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('input[type="email"]').value.trim().toLowerCase();
      const pass = loginForm.querySelector('input[type="password"]').value;
      const users = loadUsers();
      const found = users.find(u => u.email === email && u.password === pass);
      if (found) {
        setCurrentUser({ name: found.name, email: found.email, joined: found.joined });
        updateHeaderForAuth();
        window.location.href = "profile.html";
      } else alert("Login failed — wrong email or password (demo accounts stored locally).");
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = signupForm.querySelector('input[placeholder="Name"], input[type="text"]').value.trim();
      const email = signupForm.querySelector('input[type="email"]').value.trim().toLowerCase();
      const pass = signupForm.querySelector('input[type="password"]').value;
      let users = loadUsers();
      if (users.find(u=>u.email===email)) { alert("Email already used. Try logging in."); return; }
      const newUser = { name: name || "Customer", email, password: pass, joined: new Date().toISOString() };
      users.push(newUser);
      saveUsers(users);
      setCurrentUser({ name: newUser.name, email: newUser.email, joined: newUser.joined });
      updateHeaderForAuth();
      window.location.href = "profile.html";
    });
  }

  // OAuth placeholders (simulate)
  oauthGoogle.forEach(btn => btn.addEventListener("click", () => {
    // demo: create or find user then sign in
    const users = loadUsers();
    const demoEmail = "google_user@example.com";
    let user = users.find(u => u.email === demoEmail);
    if (!user) {
      user = { name: "Google User", email: demoEmail, password: "", joined: new Date().toISOString() };
      users.push(user); saveUsers(users);
    }
    setCurrentUser({ name: user.name, email: user.email, joined: user.joined });
    updateHeaderForAuth();
    window.location.href = "profile.html";
  }));
  oauthFacebook.forEach(btn => btn.addEventListener("click", () => {
    const users = loadUsers();
    const demoEmail = "facebook_user@example.com";
    let user = users.find(u => u.email === demoEmail);
    if (!user) {
      user = { name: "Facebook User", email: demoEmail, password: "", joined: new Date().toISOString() };
      users.push(user); saveUsers(users);
    }
    setCurrentUser({ name: user.name, email: user.email, joined: user.joined });
    updateHeaderForAuth();
    window.location.href = "profile.html";
  }));
}

/* Display profile data on profile.html */
function renderProfilePage() {
  const profileWrap = document.querySelector(".profile-container");
  if (!profileWrap) return;
  const user = getCurrentUser();
  if (!user) {
    profileWrap.innerHTML = `<p>Please <a href="login.html">log in</a> to see your profile.</p>`;
    return;
  }
  const orders = loadOrdersForDemo(user.email);
  profileWrap.innerHTML = `
    <h1>Welcome, ${escapeHtml(user.name)}</h1>
    <section class="profile-info">
      <h2>Account Details</h2>
      <p><strong>Name:</strong> ${escapeHtml(user.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
      <p><strong>Joined:</strong> ${new Date(user.joined).toLocaleDateString()}</p>
      <button id="logout-btn">Logout</button>
    </section>
    <section class="orders">
      <h2>Order History</h2>
      ${orders.length ? orders.map(o=>`<div class="order-item"><p>Order #${escapeHtml(o.id)} - $${escapeHtml(o.total)}</p></div>`).join("") : "<p>No orders yet.</p>"}
    </section>
  `;
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", ()=> { logoutUser(); });
}

/* Dummy order storage for demo (store orders in localStorage keyed by email) */
function loadOrdersForDemo(email) {
  try {
    const all = JSON.parse(localStorage.getItem("pusy_orders_v1")||"{}");
    return (all[email] || []);
  } catch { return []; }
}
function saveOrderForDemo(email, orderObj) {
  try {
    const all = JSON.parse(localStorage.getItem("pusy_orders_v1")||"{}");
    if (!all[email]) all[email] = [];
    all[email].push(orderObj);
    localStorage.setItem("pusy_orders_v1", JSON.stringify(all));
  } catch {}
}

/* Update header display after login/logout */
function updateHeaderForAuth() {
  const user = getCurrentUser();
  const profileLinks = document.querySelectorAll(".user-name-display");
  if (user) {
    profileLinks.forEach(el => el.textContent = user.name);
  } else {
    profileLinks.forEach(el => el.textContent = "Account");
  }
}

/* ===========================
   PayPal / Checkout Hooks
   =========================== */

/* PayPal button is initialized in checkout.html inline script which reads cartTotal from localStorage.
   After successful capture, call finalizeOrderDemo() to store order and notify. */
function finalizeOrderDemo(paypalDetails) {
  // paypalDetails is optional object with payer info
  const cart = loadCart();
  if (cart.length === 0) return;
  const total = cartTotal();
  const user = getCurrentUser() || { email: "guest@example.com", name: "Guest" };
  const orderId = 'OD' + Date.now();
  const order = {
    id: orderId,
    total: total,
    items: cart,
    createdAt: new Date().toISOString(),
    payer: paypalDetails?.payer || null
  };
  saveOrderForDemo(user.email, order);
  clearCart();
  // send simulated email? (real email requires backend)
  // redirect to success page
  window.location.href = "success.html";
}

/* ===========================
   Init / Attach Events on Load
   =========================== */

function initGlobalButtons() {
  // attach add-to-cart for any existing product cards (if dynamic addition happened earlier)
  document.querySelectorAll(".add-cart-btn").forEach(btn => {
    if (!btn.dataset.bound) {
      btn.dataset.bound = "1";
      btn.addEventListener("click", (e) => {
        const id = btn.dataset.id;
        if (id) addToCartById(id, 1);
      });
    }
  });
}

function initFiltersUI() {
  // category select on collections page
  const categorySelect = document.getElementById("category-filter");
  if (categorySelect) {
    const saved = localStorage.getItem(KEY_SELECTED_CATEGORY) || "all";
    categorySelect.value = saved;
    categorySelect.addEventListener("change", () => {
      localStorage.setItem(KEY_SELECTED_CATEGORY, categorySelect.value);
      renderCollectionGrid();
    });
  }
  const sortSelect = document.getElementById("sort-filter");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => renderCollectionGrid());
  }
}

/* Attach "click category quick links" (homepage) */
function initPageSpecifics() {
  // Home
  renderHomeProducts();
  initCategoryQuickLinks();

  // Collections page
  renderCollectionGrid();

  // Cart page
  renderCartPage();

  // Checkout page
  renderCheckoutPage();

  // Profile page
  renderProfilePage();

  // Auth forms
  initAuthForms();

  // header auth text
  updateHeaderForAuth();

  // attach global add-to-cart buttons
  initGlobalButtons();

  // update cart count
  updateCartCount();
}

/* safe DOMContentLoaded init */
document.addEventListener("DOMContentLoaded", () => {
  try {
    initSearchPanel();
    initFiltersUI();
    initPageSpecifics();

    // attach click handlers for placeholder OAuth buttons if present
    document.querySelectorAll(".oauth-google").forEach(btn => {
      btn.addEventListener("click", ()=> {
        // demo simulation handled in initAuthForms
      });
    });
    document.querySelectorAll(".oauth-facebook").forEach(btn => {
      btn.addEventListener("click", ()=> {
        // demo simulation handled in initAuthForms
      });
    });

  } catch (err) {
    console.error("Error initializing main.js:", err);
  }
});
