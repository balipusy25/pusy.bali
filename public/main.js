/* main.js — front-end logic: products, cart (localStorage), search, auth UI, checkout hooks */

const App = (function(){
  const STORAGE_CART = 'pusy_cart_v1';
  const STORAGE_USER = 'pusy_user_v1';

  const products = [
    {id:1,slug:'ribbed-midi-dress',title:'Ribbed Midi Dress',price:89,images:['assets/item1.jpg','assets/item1-2.jpg','assets/item1-3.jpg'],desc:'Fitted ribbed midi dress. Soft stretch blend.',inventory:12},
    {id:2,slug:'silk-blouse',title:'Silk Blouse',price:79,images:['assets/item2.jpg'],desc:'Light silk blouse, elevated staple.',inventory:10},
    {id:3,slug:'everyday-tee',title:'Everyday Tee',price:35,images:['assets/item3.jpg'],desc:'Perfect tee, soft cotton.',inventory:40},
    {id:4,slug:'wide-leg-pants',title:'Wide Leg Pants',price:120,images:['assets/item4.jpg'],desc:'Flowy wide-leg trousers.',inventory:6},
    {id:5,slug:'mini-skirt',title:'Mini Skirt',price:65,images:['assets/item5.jpg'],desc:'Flattering mini skirt.',inventory:8},
    {id:6,slug:'lightweight-jacket',title:'Lightweight Jacket',price:95,images:['assets/item6.jpg'],desc:'Layer-ready jacket.',inventory:7},
    {id:7,slug:'knit-top',title:'Knit Top',price:75,images:['assets/item7.jpg'],desc:'Textured knit top.',inventory:11},
    {id:8,slug:'wrap-dress',title:'Wrap Dress',price:110,images:['assets/item8.jpg'],desc:'Effortless wrap dress.',inventory:5},
    {id:9,slug:'layered-tank',title:'Layered Tank',price:40,images:['assets/item9.jpg'],desc:'Light layering tank.',inventory:20},
    {id:10,slug:'structured-blazer',title:'Structured Blazer',price:150,images:['assets/item10.jpg'],desc:'Tailored blazer.',inventory:4},
    {id:11,slug:'denim-short',title:'Denim Short',price:55,images:['assets/item11.jpg'],desc:'Casual denim short.',inventory:15},
    {id:12,slug:'silk-scarf',title:'Silk Scarf',price:45,images:['assets/item12.jpg'],desc:'Luxury silk scarf.',inventory:30}
  ];

  function getCart(){ return JSON.parse(localStorage.getItem(STORAGE_CART) || '[]'); }
  function saveCart(cart){ localStorage.setItem(STORAGE_CART, JSON.stringify(cart)); updateCartBadge(); }
  function clearCart(){ localStorage.removeItem(STORAGE_CART); updateCartBadge(); }

  function addToCart(productId, qty=1){
    const p = products.find(x=>x.id===productId); if(!p) return;
    const cart = getCart();
    const existing = cart.find(i=>i.id===productId);
    if(existing) existing.qty += qty; else cart.push({id:productId,qty});
    saveCart(cart);
  }
  function removeFromCart(index){ const cart=getCart(); cart.splice(index,1); saveCart(cart); }
  function updateQty(index,newQty){ const cart=getCart(); if(newQty<=0) cart.splice(index,1); else cart[index].qty=newQty; saveCart(cart); }

  function cartTotals(){
    const cart = getCart(); let subtotal=0,items=0;
    cart.forEach(i=>{ const p=products.find(pp=>pp.id===i.id); if(p){ subtotal+=p.price*i.qty; items+=i.qty }});
    return {subtotal,items};
  }

  function updateCartBadge(){
    const countEls = document.querySelectorAll('.cart-count');
    const t = cartTotals().items;
    countEls.forEach(e=> e.textContent = t);
  }

  function renderProductsGrid(selector, items){
    const container = document.querySelector(selector); if(!container) return;
    container.innerHTML = items.map(p=>{
      return `
      <div class="product-card" role="article">
        <a href="product.html?id=${p.id}">
          <div class="product-media"><img src="${p.images[0]}" alt="${escapeHtml(p.title)}"></div>
        </a>
        <div class="product-body">
          <div class="product-title">${escapeHtml(p.title)}</div>
          <div class="product-price">$${p.price.toFixed(2)}</div>
          <div style="margin-top:10px;display:flex;gap:8px;">
            <button class="icon-btn" onclick="App.addToCartHandler(${p.id})" aria-label="Add ${escapeHtml(p.title)} to cart">Add to cart</button>
            <a class="icon-btn" href="product.html?id=${p.id}">View</a>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function renderProductDetail(){
    const el = document.getElementById('product-detail-root'); if(!el) return;
    const id = Number(new URLSearchParams(location.search).get('id') || 1);
    const p = products.find(x=>x.id===id);
    if(!p) return el.innerHTML='<p>Product not found</p>';
    el.innerHTML = `
      <div class="gallery">
        <img id="mainProdImage" src="${p.images[0]}" alt="${escapeHtml(p.title)}" style="width:100%;border-radius:8px">
        <div class="thumbs" style="margin-top:12px;">
          ${p.images.map(img=>`<div class="thumb"><img src="${img}" onclick="document.getElementById('mainProdImage').src='${img}'" alt=""></div>`).join('')}
        </div>
      </div>
      <div class="product-info">
        <h2>${escapeHtml(p.title)}</h2>
        <div style="color:var(--sub);margin:8px 0;">SKU: PB-${String(p.id).padStart(4,'0')}</div>
        <div style="font-weight:700;font-size:1.4rem;">$${p.price.toFixed(2)}</div>
        <p style="color:var(--sub);margin-top:12px">${escapeHtml(p.desc)}</p>
        <div style="margin-top:14px;display:flex;gap:10px;">
          <select id="selQty" class="input" style="width:120px"><option>1</option><option>2</option><option>3</option><option>4</option></select>
        </div>
        <div style="margin-top:14px;display:flex;gap:8px;">
          <button class="btn icon-btn" onclick="App.addToCartHandler(${p.id})">Add to cart</button>
          <button class="btn icon-btn" style="background:#fff;border:1px solid #eee;color:var(--accent)" onclick="location.href='cart.html'">Go to cart</button>
        </div>
      </div>
    `;
  }

  function setupSearch(){
    const box = document.querySelector('.search-box');
    if(!box) return;
    box.addEventListener('input', (e)=>{
      const q = e.target.value.trim().toLowerCase();
      const visible = products.filter(p=>p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
      renderProductsGrid('#search-results', visible.slice(0,12));
      // Also update collections grid if present
      const colRoot = document.getElementById('collections-root');
      if(colRoot) renderProductsGrid('#collections-root', visible);
    });
  }

  function getUser(){ return JSON.parse(localStorage.getItem(STORAGE_USER) || 'null'); }
  function setUser(u){ localStorage.setItem(STORAGE_USER, JSON.stringify(u)); renderAuthUI(); }
  function logout(){ localStorage.removeItem(STORAGE_USER); renderAuthUI(); }

  function renderAuthUI(){
    const me = getUser();
    const targets = document.querySelectorAll('.auth-area');
    targets.forEach(t=>{
      if(me) t.innerHTML = `<div style="display:flex;gap:8px;align-items:center"><span style="font-weight:700">${escapeHtml(me.name)}</span><button class="icon-btn" onclick="App.logout()">Logout</button></div>`;
      else t.innerHTML = `<a class="icon-btn" href="login.html">Sign in</a>`;
    });
  }

  function renderCartPage(){
    const root = document.getElementById('cart-root'); if(!root) return;
    const cart = getCart();
    if(cart.length===0){
      root.innerHTML = `<div style="text-align:center;padding:60px 18px"><h3>Your cart is empty</h3><p style="color:var(--sub)">Add items from collections or product pages.</p><div style="margin-top:18px"><a class="btn" href="collections.html">Shop Collections</a></div></div>`; updateCartBadge(); return;
    }
    let html = `<table class="cart-table" role="table" aria-label="Cart items"><thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>`;
    cart.forEach((it,idx)=>{
      const p = products.find(pp=>pp.id===it.id);
      const subtotal = p.price * it.qty;
      html += `<tr>
        <td style="display:flex;gap:12px;align-items:center">
          <img src="${p.images[0]}" style="width:84px;height:100px;object-fit:cover;border-radius:8px" alt="${escapeHtml(p.title)}">
          <div><div style="font-weight:700">${escapeHtml(p.title)}</div><div style="color:var(--sub)">SKU: PB-${String(p.id).padStart(4,'0')}</div></div>
        </td>
        <td>$${p.price.toFixed(2)}</td>
        <td><input aria-label="Quantity for ${escapeHtml(p.title)}" type="number" min="1" value="${it.qty}" style="width:70px;padding:6px" onchange="App.updateQty(${idx}, this.value)"></td>
        <td>$${subtotal.toFixed(2)}</td>
        <td><button class="icon-btn" onclick="App.removeFromCart(${idx})">Remove</button></td>
      </tr>`;
    });
    html += `</tbody></table>`;
    const totals = cartTotals();
    html += `<div style="text-align:right;margin-top:16px"><div style="font-weight:700">Subtotal: $${totals.subtotal.toFixed(2)}</div><div style="margin-top:8px"><a class="btn" href="checkout.html">Proceed to checkout</a></div></div>`;
    root.innerHTML = html;
    updateCartBadge();
  }

  function renderCheckout(){
    const root = document.getElementById('checkout-root'); if(!root) return;
    const totals = cartTotals();
    if(totals.items===0){ root.innerHTML = `<div style="text-align:center;padding:80px"><h3>Your cart is empty</h3><p style="color:var(--sub)">Add items before checking out.</p><div style="margin-top:18px"><a class="btn" href="collections.html">Shop Collections</a></div></div>`; return;}
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="payment-card"><h3>Shipping address</h3>
          <label for="ship-name">Full name</label><input id="ship-name" class="input" placeholder="Full name">
          <label for="ship-line1" style="margin-top:8px">Address</label><input id="ship-line1" class="input" placeholder="Address line 1">
          <div style="display:flex;gap:8px;margin-top:8px"><input class="input" id="ship-city" placeholder="City"><input class="input" id="ship-post" placeholder="Postal code" style="width:140px"></div>
        </div>

        <div class="payment-card">
          <h3>Payment method</h3>
          <div class="payment-method">
            <label><input type="radio" name="pay" value="card" checked> Card (Visa/Mastercard)</label>
            <label><input type="radio" name="pay" value="paypal"> PayPal</label>
            <label><input type="radio" name="pay" value="apple"> Apple Pay</label>
          </div>

          <div id="card-form" style="margin-top:12px">
            <input class="input" id="card-number" placeholder="Card number">
            <div style="display:flex;gap:8px;margin-top:8px">
              <input class="input" id="card-exp" placeholder="MM/YY"><input class="input" id="card-cvc" placeholder="CVC" style="width:110px">
            </div>
          </div>
        </div>

        <div style="text-align:right"><div style="font-weight:700;margin-bottom:8px">Order summary: $${totals.subtotal.toFixed(2)}</div>
          <button class="btn" id="placeOrderBtn">Place order</button>
        </div>
      </div>
    `;
    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
  }

  function placeOrder(){
    // client-side demo: validate minimal fields and clear
    const name = document.getElementById('ship-name')?.value;
    if(!name){ alert('Please enter shipping full name'); return; }
    // In production create payment sessions server-side
    clearCart();
    alert('Order placed (demo). In production you would go to payment provider.');
    location.href='checkout-success.html';
  }

  function escapeHtml(str){ return String(str).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]); }

  // Expose functions for inline usage
  return {
    addToCartHandler: function(id){
      const qtySel = document.getElementById('selQty');
      const qty = qtySel ? Number(qtySel.value||1) : 1;
      addToCart(id, qty);
      updateCartBadge();
      const tmp = document.createElement('div'); tmp.innerText='Added to cart'; tmp.setAttribute('role','status');
      tmp.style.cssText='position:fixed;right:18px;bottom:18px;padding:10px 14px;background:#111;color:#fff;border-radius:8px;z-index:9999';
      document.body.appendChild(tmp); setTimeout(()=>tmp.remove(),1500);
    },
    removeFromCart: function(i){ removeFromCart(i); renderCartPage(); },
    updateQty: function(i,v){ updateQty(i, Number(v)); renderCartPage(); },
    logout: logout,
    init: function(){
      renderProductsGrid('#grid-products', products.slice(0,8));
      const searchResultRoot = document.getElementById('search-results'); if(searchResultRoot) renderProductsGrid('#search-results', products.slice(0,8));
      const collectionsRoot = document.getElementById('collections-root'); if(collectionsRoot) renderProductsGrid('#collections-root', products);
      renderProductDetail();
      renderCartPage();
      renderCheckout();
      setupSearch();
      renderAuthUI();
      updateCartBadge();
      document.querySelectorAll('.hamburger').forEach(b=>b.addEventListener('click', ()=>document.getElementById('mainNav')?.classList.toggle('open')));
      // load more button
      const loadMoreBtn = document.getElementById('loadMoreBtn'); if(loadMoreBtn) loadMoreBtn.addEventListener('click', ()=>{
        document.querySelectorAll('.product-card.hidden').forEach((el,i)=>{ if(i<6) el.classList.remove('hidden'); });
      });
    }
  };
})();

window.App = App;
document.addEventListener('DOMContentLoaded', ()=>App.init());
