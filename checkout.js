// checkout.js
(function(){
  const $ = sel => document.querySelector(sel);

  function getCartFull() {
    const cart = JSON.parse(localStorage.getItem('pusy_cart') || '[]');
    const products = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    const items = cart.map(ci => {
      const p = products.find(pp => pp.id === ci.id) || { name:'Item', price:0, images:['assets/pic2.jpg'] };
      return { id:ci.id, name:p.name, price:p.price, qty:ci.qty };
    });
    return items;
  }

  function renderOrderSummary() {
    const list = getCartFull();
    const wrap = $('#order-summary');
    if(!wrap) return;
    if(list.length === 0) {
      wrap.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }
    let html = '';
    let total = 0;
    list.forEach(it => {
      total += (it.price || 0) * (it.qty || 1);
      html += `<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">
        <div style="flex:1">${it.name} x ${it.qty}</div>
        <div style="font-weight:700">$${((it.price||0)*(it.qty||1)).toFixed(2)}</div>
      </div>`;
    });
    html += `<hr/><div style="text-align:right;font-weight:800;font-size:18px">Total: $${total.toFixed(2)}</div>`;
    wrap.innerHTML = html;
  }

  function attachForm() {
    const form = $('#checkout-form');
    if(!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      // Save a minimal order to localStorage as 'last_order' - in production you'd send to server
      const items = getCartFull();
      const total = items.reduce((s,i)=> s + (i.price||0)*(i.qty||1), 0);
      const order = {
        id: 'ord-' + Date.now(),
        name: form.querySelector('[name=name]').value,
        email: form.querySelector('[name=email]').value,
        address: form.querySelector('[name=address]').value,
        items, total, createdAt: new Date().toISOString()
      };
      localStorage.setItem('pusy_last_order', JSON.stringify(order));
      // clear cart
      localStorage.removeItem('pusy_cart');
      // in production we'd call PayPal/Stripe here; currently show placeholder and redirect to success
      // If config.js exists and has PAYPAL_CLIENT_ID, PayPal smart buttons should be loaded separately
      window.location.href = 'success.html';
    });
  }

  document.addEventListener('DOMContentLoaded', ()=> {
    renderOrderSummary();
    attachForm();

    // Render PayPal placeholder button if config exists
    if(window.__PAYPAL_PLACEHOLDER_LOADED) return;
    // Try to load config.js (if owner created it)
    function tryLoadConfig() {
      if(typeof CONFIG !== 'undefined' && CONFIG.PAYPAL_CLIENT_ID && !CONFIG.PAYPAL_CLIENT_ID.includes('REPLACE_WITH')) {
        // load PayPal SDK dynamically
        const s = document.createElement('script');
        s.src = `https://www.paypal.com/sdk/js?client-id=${CONFIG.PAYPAL_CLIENT_ID}&currency=USD`;
        s.onload = setupPaypal;
        document.head.appendChild(s);
      } else {
        // show notice
        const container = document.getElementById('paypal-button-area');
        if(container) container.innerHTML = `<div style="padding:12px;border-radius:8px;background:#fff3cd;border:1px solid #ffecb5;color:#664d03">PayPal not configured. Add your client id to <code>config.js</code>.</div>`;
      }
    }

    function setupPaypal() {
      window.__PAYPAL_PLACEHOLDER_LOADED = true;
      const container = document.getElementById('paypal-button-area');
      if(!container) return;
      // compute total
      const items = getCartFull();
      const total = items.reduce((s,i)=> s + (i.price||0)*(i.qty||1), 0).toFixed(2);
      if(typeof paypal === 'undefined') {
        container.innerHTML = '<p>PayPal SDK failed to load.</p>';
        return;
      }
      paypal.Buttons({
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{ amount: { value: total } }]
          });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            // create a simple order record locally
            const order = { id:'pp-'+Date.now(), provider:'paypal', details, createdAt:new Date().toISOString() };
            localStorage.setItem('pusy_last_order', JSON.stringify(order));
            // clear cart
            localStorage.removeItem('pusy_cart');
            window.location.href = 'success.html';
          });
        },
        onError: function(err) {
          alert('PayPal error');
          console.error(err);
        }
      }).render('#paypal-button-area');
    }

    // Try to import config.js if present (owner should create from config.example.js)
    const scriptTags = Array.from(document.getElementsByTagName('script'));
    const hasConfig = scriptTags.some(s => s.src && s.src.includes('config.js'));
    if(hasConfig) {
      // config.js should define CONFIG as export? But since we can't import here without module,
      // owner should include config.js as a plain global (not exported) OR we attempt to fetch it.
      tryLoadConfig();
    } else {
      // no config.js included; show notice
      tryLoadConfig();
    }
  });
})();
