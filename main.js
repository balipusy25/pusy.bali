// ====== CART FUNCTIONALITY ======
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartCount = document.getElementById('cart-count');
const cartItemsDiv = document.getElementById('cart-items');

function updateCartCount() {
  if (cartCount) cartCount.textContent = cart.length;
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(name, price) {
  cart.push({ name, price });
  saveCart();
  alert(`${name} added to cart`);
}

// Display cart items on cart page
function displayCart() {
  if (!cartItemsDiv) return;
  cartItemsDiv.innerHTML = '';
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <p>${item.name} - $${item.price}</p>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;
    cartItemsDiv.appendChild(div);
  });
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  displayCart();
}

// ====== SEARCH FUNCTIONALITY ======
const searchInput = document.getElementById('search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll('.product').forEach(product => {
      const name = product.querySelector('h3').textContent.toLowerCase();
      product.style.display = name.includes(query) ? 'block' : 'none';
    });
  });
}

// ====== MOBILE MENU ======
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

// Initialize
updateCartCount();
displayCart();
