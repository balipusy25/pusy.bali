/* checkout.js */
(function(){
  const $ = s => document.querySelector(s);

  function getCartFull(){
    const cart = JSON.parse(localStorage.getItem('pusy_cart') || '[]');
    const prods = JSON.parse(localStorage.getItem('pusy_products') || '[]');
    return cart.map(ci => {
      const p = prods.find(pp => pp.id === ci.id) || { name:'Unknown', price:0 };
      return { id:ci.id, name:p.name, price:p.price, qty:ci.qty || 1 };
    });
  }

  function placeOrderLocally(details){
    const order = {
      id: 'order-' + Date.now(),
      createdAt: new Date().toISOString(),
      details,
      items: getCartFull()
    };
    localStorage.setItem('pusy_last_order', JSON.stringify(order));
    // clear cart
    localStorage.removeItem('pusy_cart');
    return order;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // summary
    if(window.renderOrderSummary) window.renderOrderSummary();

    // form submit
    const form = $('#checkout-form');
    if(form){
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const name = form.querySelector('[name=name]').value || '';
        const email = form.querySelector('[name=email]').value || '';
        const address = form.querySelector('[name=address]').value || '';
        const city = form.querySelector('[name=city]').value || '';
        const postal = form.querySelector('[name=postal]').value || '';
        const details = { name, email, address, city, postal, method:'manual' };
        placeOrderLocally(details);
        // redirect to success
        window.location.href = 'success.html';
      });
    }

    // PayPal Smart Buttons if config provided
    // Owner may include config.js (window.CONFIG) before this script in checkout.html
    function tryLoadPayPal(){
      const cfg = window.CONFIG || null;
      if(cfg && cfg.PAYPAL_CLIENT_ID && !cfg.PAYPAL_CLIENT_ID.includes('REPLACE_WITH')){
        const s = document.createElement('script');
        s.src = `https://www.paypal.com/sdk/js?client-id=${cfg.PAYPAL_CLIENT_ID}&currency=USD`;
        s.onload = setupButtons;
        document.head.appendChild(s);
      } else {
        const container = document.getElementById('paypal-button-area');
        if(container){
          container.innerHTML = `<div style="padding:12px;background:#fff3cd;border:1px solid #ffecb5;border-radius:8px;color:#664d03">PayPal placeholder: add config.js to enable Smart Buttons.</div>`;
        }
      }
    }

    function setupButtons(){
      const container = document.getElementById('paypal-button-area');
      if(!container || typeof paypal === 'undefined') return;
      const items = getCartFull();
      const total = items.reduce((s,i)=> s + (i.price||0)*(i.qty||1), 0).toFixed(2);
      paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({ purchase_units: [{ amount: { value: total } }]});
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            placeOrderLocally({ method:'paypal', details: details });
            window.location.href = 'success.html';
          });
        }
      }).render('#paypal-button-area');
    }

    tryLoadPayPal();
  });
})();
