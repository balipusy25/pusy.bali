// script.js
// Main site logic: cart, product rendering, search, header UI.
// This file is not a module (for broad compatibility), but pages that need Firebase will import firebase-config separately.

(function () {
  // Cart stored in localStorage as 'puys_cart_v1'
  const CART_KEY = 'puys_cart_v1';
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

  // DOM helpers
  const q = sel => document.querySelector(sel);
  const qAll = sel => Array.from(document.querySelectorAll(sel));

  // Update all cart-count elements
  function updateCartCount() {
    const count = cart.reduce((s, it) => s + (it.qty || 1), 0);
    qAll('.cart-count').forEach(el => el.textContent = count);
  }

  // Save cart
  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  // Add product to cart
  window.addToCart = function (product) {
    // product should be an object { id?, name, price, image, qty? }
    const existsIdx = cart.findIndex(ci => ci.id && product.id && ci.id === product.id && ci.variant === product.variant);
    if (existsIdx > -1) {
      cart[existsIdx].qty = (cart[existsIdx].qty || 1) + (product.qty || 1);
    } else {
      const p = Object.assign({ qty: 1 }, product);
      cart.push(p);
    }
    saveCart();
    updateCartCount();
    // quick UI feedback
    if (typeof window.onCartUpdated === 'function') window.onCartUpdated(cart);
    alert(`${product.name} added to cart`);
  };

  // Render product list to a container id
  window.renderProducts = function (products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    products.forEach(p => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <a class="product-link" data-id="${p.id || ''}">
          <img src="${p.image || 'assets/pic1.jpg'}" alt="${p.name}">
          <h3>${p.name}</h3>
          <div class="price">$${Number(p.price || 0).toFixed(2)}</div>
        </a>
        <div class="product-actions">
          <button class="btn tiny add-to-cart">Add to cart</button>
          <button class="btn tiny view-product">View</button>
        </div>
      `;
      // attach add-to-cart handler
      card.querySelector('.add-to-cart').addEventListener('click', (e) => {
        e.preventDefault();
        window.addToCart(p);
      });
      // view product
      card.querySelector('.view-product').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('puys_selected_product', JSON.stringify(p));
        window.location.href = 'product.html';
      });
      container.appendChild(card);
    });
  };

  // Display cart items (used on cart.html)
  window.renderCartPage = function () {
    const container = document.getElementById('cart-items');
    if (!container) return;
    container.innerHTML = '';
    if (cart.length === 0) {
      container.innerHTML = '<p class="muted">Your cart is empty.</p>';
      document.getElementById('cart-total').textContent = '$0.00';
      return;
    }
    let subtotal = 0;
    cart.forEach((it, idx) => {
      subtotal += (it.price || 0) * (it.qty || 1);
      const div = document.createElement('div');
      div.className = 'cart-row';
      div.innerHTML = `
        <img src="${it.image || 'assets/pic1.jpg'}" alt="${it.name}">
        <div class="cart-row-info">
          <h4>${it.name}</h4>
          <div>$${(it.price || 0).toFixed(2)}</div>
          <div>
            <input type="number" min="1" value="${it.qty || 1}" data-idx="${idx}" class="cart-qty">
            <button class="btn tiny remove-item" data-idx="${idx}">Remove</button>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
    document.getElementById('cart-total').textContent = '$' + subtotal.toFixed(2);

    // attach events
    qAll('.cart-qty').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.idx);
        let v = parseInt(e.target.value, 10) || 1;
        if (v < 1) v = 1;
        cart[idx].qty = v;
        saveCart();
        renderCartPage();
        updateCartCount();
      });
    });
    qAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.target.dataset.idx);
        cart.splice(idx, 1);
        saveCart();
        renderCartPage();
        updateCartCount();
      });
    });
  };

  // Search redirect utility (search input with id 'search-input' on pages)
  function attachSearch() {
    const searchInput = q('#search-input');
    const searchBtn = q('#search-btn');
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        const qv = searchInput.value.trim();
        window.location.href = 'search.html?q=' + encodeURIComponent(qv);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchBtn.click();
      });
    }
  }

  // On DOM loaded
  document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    attachSearch();

    // If collections or home pages have containers, render sample products (if none provided)
    const newGrid = document.getElementById('new-products');
    const collectionGrid = document.getElementById('collection-products');

    // sample fallback products (can be replaced by Firestore fetch)
    const sampleProducts = [
      { id: 'p1', name: 'New Yoga Tank', category: 'tanks', price: 49.99, image: 'assets/pic6.jpg' },
      { id: 'p2', name: 'Stretch Bottoms', category: 'bottoms', price: 69.99, image: 'assets/pic7.jpg' },
      { id: 'p3', name: 'Performance Tee', category: 'new', price: 39.99, image: 'assets/pic8.jpg' },
      { id: 'p4', name: 'Gym Shorts', category: 'gym', price: 34.99, image: 'assets/pic9.jpg' }
    ];

    if (newGrid) renderProducts(sampleProducts, 'new-products');
    if (collectionGrid) renderProducts(sampleProducts, 'collection-products');

    // If on cart page
    if (q('#cart-items')) renderCartPage();

    // If on product page, populate with selected product
    const selected = localStorage.getItem('puys_selected_product');
    if (selected && q('#prod-title')) {
      const p = JSON.parse(selected);
      q('#prod-title').textContent = p.name;
      q('#prod-price').textContent = '$' + Number(p.price || 0).toFixed(2);
      const img1 = q('#prod-img-1'); if (img1) img1.src = p.image || 'assets/pic6.jpg';
      const addBtn = q('#prod-add');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const qty = Number(q('#prod-qty')?.value || 1);
          const prod = Object.assign({}, p, { qty });
          window.addToCart(prod);
        });
      }
    }

    // If on search.html, read query and show filtered results
    if (window.location.pathname.endsWith('search.html')) {
      const params = new URLSearchParams(window.location.search);
      const qv = params.get('q') || params.get('qv') || localStorage.getItem('searchQuery') || '';
      const searchResultsContainer = q('#search-results');
      if (qv && searchResultsContainer) {
        const filtered = sampleProducts.filter(sp => sp.name.toLowerCase().includes(qv.toLowerCase()));
        if (filtered.length === 0) searchResultsContainer.innerHTML = '<p class="muted">No results</p>';
        else renderProducts(filtered, 'search-results');
      }
    }
  });

  // Expose updateCartCount to other scripts
  window.updateCartCount = updateCartCount;
  window.getCart = () => cart;
  window.saveCart = saveCart;
})();
