// script.js

// ======== GLOBAL ELEMENTS ========
const cartCount = document.querySelector('.cart-count');
const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
const userDisplay = document.querySelector('.user-display');
const searchForm = document.querySelector('.search-form');

// ======== CART COUNT ========
function updateCartCount() {
  if (cartCount) {
    cartCount.textContent = cartItems.length;
  }
}
updateCartCount();

// ======== ADD TO CART ========
function addToCart(product) {
  cartItems.push(product);
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateCartCount();
}

// ======== USER LOGIN STATE ========
const currentUser = JSON.parse(localStorage.getItem('user'));
if (userDisplay && currentUser) {
  userDisplay.innerHTML = `<span>Hi, ${currentUser.name}</span>`;
}

// ======== SEARCH FUNCTION ========
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = e.target.querySelector('input').value.trim();
    if (query) {
      localStorage.setItem('searchQuery', query);
      window.location.href = 'search.html';
    }
  });
}

// ======== FILTERING ========
function filterProducts(criteria) {
  const products = document.querySelectorAll('.product-card');
  products.forEach((card) => {
    const category = card.dataset.category;
    if (criteria === 'all' || category === criteria) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}
