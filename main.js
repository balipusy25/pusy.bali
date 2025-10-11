// -------------------------
// Global Variables
// -------------------------
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// -------------------------
// CART FUNCTIONS
// -------------------------
function addToCart(productId, productName, price, image) {
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, name: productName, price, image, qty: 1 });
  }
  saveCart();
  updateCartCount();
  alert(`${productName} added to cart.`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
  updateCartCount();
}

function changeQuantity(productId, newQty) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty = parseInt(newQty);
    if (item.qty <= 0) removeFromCart(productId);
  }
  saveCart();
  renderCart();
  updateCartCount();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = cart.reduce((a, b) => a + b.qty, 0);
  const badge = document.querySelector(".cart-count");
  if (badge) badge.textContent = count;
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    document.querySelector("#cart-total").textContent = "$0.00";
    return;
  }

  cart.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-details">
        <h4>${item.name}</h4>
        <p>$${item.price.toFixed(2)}</p>
        <input type="number" min="1" value="${item.qty}" onchange="changeQuantity('${item.id}', this.value)">
        <button onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.querySelector("#cart-total").textContent = "$" + total.toFixed(2);
}

// -------------------------
// CHECKOUT FUNCTIONS
// -------------------------
function initPayPalButton() {
  if (typeof paypal === "undefined") return;

  paypal.Buttons({
    style: {
      shape: "rect",
      color: "gold",
      layout: "vertical",
      label: "paypal",
    },
    createOrder: function (data, actions) {
      const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
      return actions.order.create({
        purchase_units: [{
          amount: { value: total.toFixed(2) },
        }],
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        alert("Payment completed by " + details.payer.name.given_name);
        finalizeOrderDemo(details);
      });
    },
    onError: function (err) {
      console.error(err);
      alert("Something went wrong during payment.");
    }
  }).render("#paypal-button-container");
}

// This is just a demo function.
// A real one would call your backend webhook endpoint.
function finalizeOrderDemo(details) {
  console.log("Finalize order demo:", details);
  cart = [];
  saveCart();
  updateCartCount();
  alert("Order successful! Check console for details.");
}

// -------------------------
// LOGIN / SIGNUP LOGIC
// -------------------------
function signup(email, password) {
  if (users.find(u => u.email === email)) {
    alert("Email already registered!");
    return false;
  }
  const newUser = { email, password };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Signup successful!");
  return true;
}

function login(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Login successful!");
    window.location.href = "profile.html";
  } else {
    alert("Invalid email or password.");
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  alert("You have logged out.");
  window.location.href = "index.html";
}

// Google/Facebook mock login
function loginWithProvider(provider) {
  currentUser = { email: provider + "@mockuser.com" };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  alert(`Logged in via ${provider}!`);
  window.location.href = "profile.html";
}

// -------------------------
// PROFILE PAGE LOGIC
// -------------------------
function renderProfile() {
  const container = document.getElementById("profile-info");
  if (!container) return;

  if (!currentUser) {
    container.innerHTML = `<p>Please <a href="login.html">log in</a>.</p>`;
    return;
  }

  container.innerHTML = `
    <h3>Welcome, ${currentUser.email}</h3>
    <p>You are logged in.</p>
    <button onclick="logout()">Logout</button>
  `;
}

// -------------------------
// INIT ON PAGE LOAD
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();
  renderProfile();
  if (document.getElementById("paypal-button-container")) {
    initPayPalButton();
  }
});
