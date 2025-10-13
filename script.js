/* script.js - Pusy Bali core (plain JS, no modules)
   Place <script src="script.js"></script> at end of each HTML file.
*/

(function(){
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /* ---------- sample product catalog ----------
     Products are saved to localStorage key 'pusy_products'.
     Owner replaces images in /assets; product data can be edited here or by replacing localStorage.
  */
  const SAMPLE_PRODUCTS = [
    { id:'p1', name:'New Yoga Tank', price:49.99, category:'new', images:['assets/pic2.jpg'] },
    { id:'p2', name:'Stretch Bottoms', price:69.99, category:'bottoms', images:['assets/pic3.jpg'] },
    { id:'p3', name:'Performance Tee', price:39.99, category:'new', images:['assets/pic4.jpg'] },
    { id:'p4', name:'Gym Shorts', price:34.99, category:'gym', images:['assets/pic5.jpg'] },
    { id:'p5', name:'Essential Tank', price:29.99, category:'tanks', images:['assets/pic6.jpg'] },
    { id:'p6', name:'Everyday Hoodie', price:79.99, category:'new', images:['assets/pic3.jpg'] }
  ];
  if(!localStorage.getItem('pusy_products')) localStorage.setItem('pusy_products', JSON.stringify(SAMPLE_PRODUCTS));

  // CART functions: stored as array of { id, qty }
  function getCart(){ return JSON.parse(localStorage.getItem('pusy_cart') || '[]'); }
  function saveCart(cart){ localStorage.setItem('pusy_cart', JSON.stringify(cart)); }
  function addToCart(id, qty=1){
    const cart = getCart();
    const item = cart.find(i=>i.id===id);
    if(item) item.qty = (item.qty||1) + qty;
    else cart.push({ id, qty });
    saveCart(cart);
    updateCartCount();
    return true;
  }
  function removeCartIndex(index){
    const cart = getCart();
    if(index>=0 && index < cart.length) cart.splice(index,1);
    saveCart(cart);
    updateCartCount();
  }
  function setCartQty(index, qty){
    const cart = getCart();
    if(cart[index]) { cart[index].qty = qty; saveCart(cart); updateCartCount(); }
  }

  // cart count update
  function updateCartCount(){
    const cart = getCart();
    let total = 0;
    cart.forEach(i=> total += (i.qty||1));
    $$('.cart-count').forEach(e=> e.textContent = total);
  }

  // Inject header and footer into pages using placeholders #site-header and #site-footer
  function injectShell(){
    const headerHolder = document.getElementById('site-header');
    if(headerHolder){
      headerHolder.innerHTML = `
        <div class="header-inner">
          <div class="brand">
            <a href="index.html"><img src="assets/logo.png" alt="Pusy Bali"></a>
          </div>
          <div class="nav">
            <a href="index.html">Home</a>
            <a href="collections.html">Collections</a>
            <a href="search.html">Search</a>
            <a href="contact.html">Contact</a>
          </div>
          <div class="icon-set">
            <div class="search-input" style="display:flex;align-items:center;gap:8px;">
              <input id="search-input-header" placeholder="Search products...">
              <button id="search-btn-header" class="icon-btn">🔍</button>
            </div>
            <a href="cart.html" class="icon-btn btn-cart-link">🛒 <span class="cart-count">0</span></a>
          </div>
        </div>
      `;
    }
    const footerHolder = document.getElementById('site-footer');
    if(footerHolder){
      footerHolder.innerHTML = `
        <div class="footer-inner">
          <div><img src="assets/logo.png" style="height:42px;" alt="logo"></div>
          <div><a href="https://www.instagram.com/pusy_bali/" target="_blank">Instagram</a></div>
          <div style="color:#aaa">© ${new Date().getFullYear()} Pusy Bali</div>
        </div>
      `;
    }
    attachHeaderSearch();
  }

  function attachHeaderSearch(){
    const si = $('#search-input-header');
    const sb = $('#search-btn-header');
    if(si && sb){
      sb.addEventListener('click', ()=> {
        const q = si.value.trim();
        if(!q) return;
        localStorage.setItem('pusy_search', q);
        window.location.href = 'search.html';
      });
      si.addEventListener('keydown', (e)=> { if(e.key === 'Enter') sb.click(); });
    }
  }

  // Render product cards into a containerId
  window.renderProducts = function(products, containerId){
    const cont = document.getElementById(containerId);
    if(!cont) return;
    cont.innerHTML = '';
    products.forEach(p=>{
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <img src="${(p.images && p.images[0]) || 'assets/pic2.jpg'}" alt="${p.name}">
        <h3>${p.name}</h3>
        <div class="price">$${Number(p.price).toFixed(2)}</div>
        <div class="card-actions">
          <button class="btn btn-add" data-id="${p.id}">Add to cart</button>
          <a class="btn-light" href="product.html?id=${encodeURIComponent(p.id)}" style="text-decoration:none; display:inline-block; padding:8px 12px; border-radius:8px;">View</a>
        </div>
      `;
      cont.appendChild(div);
    });
    cont.querySelectorAll('.btn-add').forEach(b => b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id; addToCart(id,1); alert('Added to cart'); 
    }));
  };

  /* ------------- page-specific flows ------------- */
  function loadHome(){
    const sample = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const featured = sample.slice(0,4);
    renderProducts(featured, 'home-products');
  }

  function goToCategory(cat){
    // cat: new, tanks, bottoms, gym or all
    window.location.href = 'collections.html?cat=' + encodeURIComponent(cat || 'all');
  }
  window.goToCategory = goToCategory; // expose for inline onclick

  function loadCollections(){
    const url = new URL(window.location.href);
    const cat = (url.searchParams.get('cat') || 'all').toLowerCase();
    const prods = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const filtered = (cat === 'all') ? prods : prods.filter(p => p.category === cat);
    renderProducts(filtered, 'collection-products');
  }

  function loadProduct(){
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    if(!id) return;
    const prods = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const p = prods.find(x=>x.id===id);
    if(!p) return;
    const holder = $('#product-detail');
    if(!holder) return;
    holder.innerHTML = `
      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <img src="${(p.images && p.images[0])||'assets/pic2.jpg'}" style="width:420px;max-width:100%;border-radius:8px;">
        <div style="flex:1;">
          <h1>${p.name}</h1>
          <div style="font-size:20px;font-weight:800;margin:8px 0;">$${Number(p.price).toFixed(2)}</div>
          <p style="color:#555;margin-bottom:12px;">Category: ${p.category}</p>
          <p style="margin-bottom:14px;">Placeholder product description — replace with the real product description for the owner.</p>
          <div style="display:flex;gap:10px;align-items:center;">
            <input id="prod-qty" type="number" min="1" value="1" style="width:84px;padding:8px;border-radius:8px;border:1px solid #ddd;">
            <button id="prod-add" class="btn">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    $('#prod-add').addEventListener('click', ()=>{
      const qty = Number($('#prod-qty').value) || 1;
      addToCart(p.id, qty);
      alert('Added to cart');
    });
  }

  function renderCartPage(){
    const holder = $('#cart-items');
    if(!holder) return;
    const prods = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const cart = getCart();
    if(cart.length === 0){
      holder.innerHTML = '<p class="center muted">Your cart is empty</p>';
      $('#cart-total') && ($('#cart-total').textContent = '0.00');
      return;
    }
    let total = 0;
    holder.innerHTML = '';
    cart.forEach((ci, idx) => {
      const p = prods.find(x=>x.id===ci.id) || { name:'Unknown', price:0, images:['assets/pic2.jpg'] };
      total += (p.price || 0) * (ci.qty || 1);
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${(p.images && p.images[0])||'assets/pic2.jpg'}" alt="${p.name}">
        <div class="meta">
          <h4>${p.name}</h4>
          <div class="muted">$${Number(p.price).toFixed(2)}</div>
          <div style="margin-top:8px;">
            <input class="qty" data-idx="${idx}" type="number" min="1" value="${ci.qty || 1}">
            <button class="btn-light remove" data-idx="${idx}" style="margin-left:8px;">Remove</button>
          </div>
        </div>
      `;
      holder.appendChild(row);
    });
    $('#cart-total') && ($('#cart-total').textContent = Number(total).toFixed(2));

    // attach events
    holder.querySelectorAll('.qty').forEach(inp => {
      inp.addEventListener('change', (e)=> {
        const idx = Number(e.target.dataset.idx); let v = Number(e.target.value) || 1; if(v<1) v=1;
        setCartQty(idx, v); renderCartPage();
      });
    });
    holder.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', (e)=>{
        const idx = Number(e.currentTarget.dataset.idx); removeCartIndex(idx); renderCartPage();
      });
    });
  }

  function loadSearch(){
    const qStored = localStorage.getItem('pusy_search') || '';
    const input = $('#search-input');
    if(input && qStored) { input.value = qStored; localStorage.removeItem('pusy_search'); doSearch(qStored); }
    const btn = $('#search-go');
    if(btn) btn.addEventListener('click', ()=> {
      const q = input.value.trim();
      if(!q) return alert('Type a search term');
      doSearch(q);
    });
  }

  function doSearch(q){
    const prods = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const filtered = prods.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    renderProducts(filtered, 'search-results');
  }

  // checkout order summary render (used in checkout.js too)
  window.renderOrderSummary = function(){
    const wrap = $('#order-summary');
    if(!wrap) return;
    const prods = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const cart = getCart();
    if(cart.length === 0){ wrap.innerHTML = '<p class="muted">Cart is empty</p>'; return; }
    let html = ''; let total = 0;
    cart.forEach(ci => {
      const p = prods.find(x=>x.id===ci.id) || { name:'Unknown', price:0 };
      total += (p.price || 0) * (ci.qty || 1);
      html += `<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><div>${p.name} x ${ci.qty}</div><div>$${((p.price||0)*(ci.qty||1)).toFixed(2)}</div></div>`;
    });
    html += `<hr/><div style="text-align:right;font-weight:800">Total: $${Number(total).toFixed(2)}</div>`;
    wrap.innerHTML = html;
  };

  // attach checkout proceed button on cart page
  function attachCartProceed(){
    const btn = $('#proceed-checkout');
    if(btn) btn.addEventListener('click', ()=> { window.location.href = 'checkout.html'; });
  }

  // init
  document.addEventListener('DOMContentLoaded', ()=>{
    injectShell();
    updateCartCount();

    if(document.getElementById('home-products')) loadHome();
    if(document.getElementById('collection-products')) loadCollections();
    if(document.getElementById('product-detail')) loadProduct();
    if(document.getElementById('cart-items')) { renderCartPage(); attachCartProceed(); }
    if(document.getElementById('search-results')) loadSearch();
    if(document.getElementById('order-summary')) renderOrderSummary();

    // header search quick attach (global header search)
    const hdrInput = $('#search-input-header');
    const hdrBtn = $('#search-btn-header');
    if(hdrBtn && hdrInput){
      hdrBtn.addEventListener('click', ()=>{
        const q = hdrInput.value.trim();
        if(!q) return;
        localStorage.setItem('pusy_search', q);
        window.location.href = 'search.html';
      });
    }
  });

})();
