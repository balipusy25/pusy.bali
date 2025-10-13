// script.js - site core (no modules). Put <script src="script.js"></script> at end of each page.

(function(){
  /* ---------- Sample product catalog ----------
     Replace or extend by editing this array or by the owner via admin later.
     Each product: id, name, price, category, images (array)
  */
  const SAMPLE_PRODUCTS = [
    { id:'p1', name:'New Yoga Tank', price:49.99, category:'new', images:['assets/pic2.jpg'] },
    { id:'p2', name:'Stretch Bottoms', price:69.99, category:'bottoms', images:['assets/pic3.jpg'] },
    { id:'p3', name:'Performance Tee', price:39.99, category:'new', images:['assets/pic4.jpg'] },
    { id:'p4', name:'Gym Shorts', price:34.99, category:'gym', images:['assets/pic5.jpg'] },
    { id:'p5', name:'Essential Tank', price:29.99, category:'tanks', images:['assets/pic6.jpg'] }
  ];

  // expose products to localStorage if not present
  if(!localStorage.getItem('pusy_products')) {
    localStorage.setItem('pusy_products', JSON.stringify(SAMPLE_PRODUCTS));
  }

  // helper DOM selectors
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // CART: stored as array of {id, qty}
  function getCart() { return JSON.parse(localStorage.getItem('pusy_cart') || '[]'); }
  function saveCart(cart) { localStorage.setItem('pusy_cart', JSON.stringify(cart)); }

  // add product by id
  window.addToCart = function addToCartById(prodId, qty=1) {
    const cart = getCart();
    const found = cart.find(i => i.id === prodId);
    if(found) found.qty += qty;
    else cart.push({ id: prodId, qty });
    saveCart(cart);
    updateCartCount();
    // subtle UI feedback
    alert('Added to cart');
  };

  // add by name & price (used by simple pages)
  window.addToCartInline = function(name, price, img) {
    // create a one-off id
    const id = 'x-' + Date.now();
    const products = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    products.push({ id, name, price: Number(price), category:'custom', images:[img||'assets/pic2.jpg']});
    localStorage.setItem('pusy_products', JSON.stringify(products));
    addToCartById(id,1);
  };

  function updateCartCount() {
    const cart = getCart();
    let total = 0;
    cart.forEach(i => total += (i.qty || 1));
    $$('.cart-count').forEach(el => el.textContent = total);
  }
  window.updateCartCount = updateCartCount;

  // Render products to container (use product objects)
  window.renderProducts = function renderProducts(products, containerId) {
    const cont = document.getElementById(containerId);
    if(!cont) return;
    cont.innerHTML = '';
    products.forEach(p => {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <img src="${(p.images && p.images[0]) || 'assets/pic2.jpg'}" alt="${p.name}">
        <h3>${p.name}</h3>
        <div class="price">$${Number(p.price).toFixed(2)}</div>
        <div style="margin-top:10px;">
          <button class="btn-add" data-id="${p.id}">Add to cart</button>
          <a href="product.html?id=${encodeURIComponent(p.id)}" class="btn" style="background:#fff; border:1px solid #000; color:#000; margin-left:8px;padding:8px 10px; border-radius:8px; text-decoration:none;">View</a>
        </div>
      `;
      cont.appendChild(el);
    });

    // attach add buttons
    cont.querySelectorAll('.btn-add').forEach(b => {
      b.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        addToCartById(id,1);
      });
    });
  };

  // homepage: load featured/new
  function loadHomepageProducts() {
    const products = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const featured = products.slice(0,4);
    renderProducts(featured, 'home-products');
  }

  // collections page: apply filters
  function loadCollections() {
    const products = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    // read filter from query param ?cat=gym or from localStorage 'pusy_filter'
    const url = new URL(window.location.href);
    const catParam = url.searchParams.get('cat') || localStorage.getItem('pusy_filter') || 'all';
    if(localStorage.getItem('pusy_filter')) localStorage.removeItem('pusy_filter');
    let filtered = products;
    if(catParam && catParam !== 'all') filtered = products.filter(p => p.category === catParam);
    renderProducts(filtered, 'collection-products');
  }

  // product page: show details for id
  function loadProductPage() {
    const url = new URL(window.location.href);
    const pid = url.searchParams.get('id');
    if(!pid) return;
    const products = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const p = products.find(x => x.id === pid);
    if(!p) return;
    const cont = $('#product-detail');
    if(!cont) return;
    cont.innerHTML = `
      <div style="display:flex;gap:18px;flex-wrap:wrap;">
        <img src="${(p.images && p.images[0]) || 'assets/pic2.jpg'}" style="width:420px;max-width:100%;border-radius:8px">
        <div style="flex:1">
          <h1>${p.name}</h1>
          <div style="font-weight:700;font-size:20px;margin:8px 0;">$${Number(p.price).toFixed(2)}</div>
          <p>Category: ${p.category}</p>
          <p style="margin-top:12px;">A nice product description placeholder. Replace with product details.</p>
          <div style="margin-top:12px;">
            <label>Qty: <input id="prod-qty" type="number" value="1" min="1" style="width:70px;padding:6px;border-radius:6px;border:1px solid #ddd"></label>
            <button id="prod-add" class="btn" style="margin-left:12px;">Add to cart</button>
          </div>
        </div>
      </div>
    `;
    $('#prod-add').addEventListener('click', ()=> {
      const qty = Number($('#prod-qty').value) || 1;
      addToCartById(p.id, qty);
    });
  }

  // cart page: render cart with details
  function renderCartPage() {
    const container = document.getElementById('cart-items');
    if(!container) return;
    const products = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const cart = getCart();
    if(cart.length === 0) {
      container.innerHTML = `<p class="center">Your cart is empty</p>`;
      const totalEl = document.getElementById('cart-total');
      if(totalEl) totalEl.textContent = '0.00';
      return;
    }
    let html = '';
    let subtotal = 0;
    cart.forEach((item, idx) => {
      const p = products.find(x => x.id === item.id) || { name: 'Unknown', price:0, images:['assets/pic2.jpg'] };
      subtotal += (p.price || 0) * (item.qty || 1);
      html += `
        <div class="cart-row">
          <img src="${(p.images && p.images[0]) || 'assets/pic2.jpg'}" alt="${p.name}">
          <div>
            <h4>${p.name}</h4>
            <div>$${Number(p.price).toFixed(2)}</div>
            <div style="margin-top:8px;">
              <input type="number" min="1" value="${item.qty || 1}" data-idx="${idx}" class="cart-qty">
              <button data-idx="${idx}" class="remove-item" style="margin-left:8px;padding:8px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer;">Remove</button>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    const totalEl = document.getElementById('cart-total');
    if(totalEl) totalEl.textContent = Number(subtotal).toFixed(2);

    // attach qty handlers
    container.querySelectorAll('.cart-qty').forEach(inp => {
      inp.addEventListener('change', e => {
        const idx = Number(e.target.dataset.idx);
        let v = Number(e.target.value) || 1;
        if(v < 1) v = 1;
        const cart = getCart();
        cart[idx].qty = v;
        saveCart(cart);
        renderCartPage();
        updateCartCount();
      });
    });
    // remove
    container.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = Number(e.currentTarget.dataset.idx);
        const cart = getCart();
        cart.splice(idx,1);
        saveCart(cart);
        renderCartPage();
        updateCartCount();
      });
    });
  }

  // search page: show results
  function loadSearchPage() {
    const q = localStorage.getItem('pusy_search') || '';
    const resultsContainer = document.getElementById('search-results');
    if(!resultsContainer) return;
    const products = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    if(filtered.length === 0) {
      resultsContainer.innerHTML = '<p class="center">No results</p>';
    } else {
      renderProducts(filtered, 'search-results');
    }
  }

  // header search button attach
  function attachHeaderSearch() {
    const sx = $('#search-input-header');
    const sb = $('#search-btn-header');
    if(sx && sb) {
      sb.addEventListener('click', () => {
        const v = sx.value.trim();
        if(!v) return;
        localStorage.setItem('pusy_search', v);
        window.location.href = 'search.html';
      });
      sx.addEventListener('keydown', (e)=> {
        if(e.key === 'Enter') sb.click();
      });
    }
  }

  // category click helpers (from homepage)
  window.goToCategory = function(cat) {
    // store filter and go to collections with query param
    window.location.href = `collections.html?cat=${encodeURIComponent(cat)}`;
  };

  // attach header cart icon to cart page
  function attachHeaderCart() {
    $$('.btn-cart-link').forEach(el => {
      el.addEventListener('click', (e)=> {
        e.preventDefault();
        window.location.href = 'cart.html';
      });
    });
  }

  // checkout button on cart page navigates to checkout
  function attachCheckoutButton() {
    const btn = $('#proceed-checkout');
    if(btn) {
      btn.addEventListener('click', () => {
        window.location.href = 'checkout.html';
      });
    }
  }

  // header & footer injection for consistent layout
  function injectHeaderFooter() {
    // header placeholder - if page has element with id 'site-header', fill it
    const headerPlace = document.getElementById('site-header');
    if(headerPlace) {
      headerPlace.innerHTML = `
        <div class="header-inner">
          <div class="brand">
            <a href="index.html"><img src="assets/logo.png" alt="Pusy Bali"></a>
            <div style="display:flex;flex-direction:column;">
              <div style="font-weight:800">Pusy Bali</div>
              <div style="font-size:12px;color:#777">Performance. Comfort. Style.</div>
            </div>
          </div>
          <div class="nav">
            <a href="index.html">Home</a>
            <a href="collections.html">Collections</a>
            <a href="search.html">Search</a>
            <a href="contact.html">Contact</a>
          </div>
          <div class="top-icons">
            <div class="header-search">
              <input id="search-input-header" placeholder="Search products...">
              <button id="search-btn-header" style="padding:8px;border-radius:8px;border:1px solid #ddd;cursor:pointer">🔍</button>
            </div>
            <a href="cart.html" class="btn-cart-link" style="position:relative;text-decoration:none;color:#222;font-weight:700;">
              🛒 <span class="cart-count">0</span>
            </a>
          </div>
        </div>
      `;
    }

    const footerPlace = document.getElementById('site-footer');
    if(footerPlace) {
      footerPlace.innerHTML = `
        <div class="footer-inner">
          <div>
            <img src="assets/logo.png" alt="logo" style="height:40px;">
          </div>
          <div>
            <p style="margin-bottom:6px">Follow us</p>
            <a href="https://www.instagram.com/pusy_bali/" target="_blank">Instagram</a>
          </div>
          <div style="color:#aaa">© ${new Date().getFullYear()} Pusy Bali</div>
        </div>
      `;
    }
  }

  // INIT - run on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', ()=> {
    injectHeaderFooter();
    attachHeaderSearch();
    attachHeaderCart();
    updateCartCount();

    // page-specific loads
    if(document.getElementById('home-products')) loadHomepageProducts();
    if(document.getElementById('collection-products')) loadCollections();
    if(document.getElementById('product-detail')) loadProductPage();
    if(document.getElementById('cart-items')) { renderCartPage(); attachCheckoutButton(); }
    if(document.getElementById('search-results')) loadSearchPage();
  });

})();
