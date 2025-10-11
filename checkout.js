/* checkout.js
   - Multi-step Amazon-style checkout
   - Renders cart (reads localStorage)
   - Quantity update, remove item, total calculation
   - Navigation between steps, confirmation clears cart
*/

document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'puysCart';
  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

  // step navigation
  let currentStep = 1;
  const totalSteps = 4;
  const steps = Array.from(document.querySelectorAll('.step'));
  const stepContents = Array.from(document.querySelectorAll('.step-content'));
  const nextButtons = Array.from(document.querySelectorAll('.next-step-btn'));
  const cartTableBody = document.querySelector('.cart-table tbody');
  const orderNumElem = document.getElementById('order-number');

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // notify script.js if present
    if (window.Puys && typeof window.Puys.updateCartCountUI === 'function') window.Puys.updateCartCountUI();
  }

  function formatMoney(n) {
    return '$' + Number(n).toFixed(2);
  }

  function calcTotals() {
    return cart.reduce((sum, it) => sum + (it.price * (it.qty || 1)), 0);
  }

  function renderCart() {
    if (!cartTableBody) return;
    cartTableBody.innerHTML = '';
    if (cart.length === 0) {
      cartTableBody.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
      return;
    }
    cart.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:left;">
          <div style="display:flex;gap:10px;align-items:center;">
            <img src="${item.img || 'assets/pic1.jpg'}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;">
            <div>
              <div style="font-weight:bold">${item.name}</div>
              <div style="font-size:12px;color:#666">${item.variant || ''}</div>
            </div>
          </div>
        </td>
        <td>${formatMoney(item.price)}</td>
        <td><input class="qty-input" type="number" min="1" value="${item.qty || 1}" data-idx="${idx}"></td>
        <td class="row-total">${formatMoney((item.price * (item.qty || 1)).toFixed(2))}</td>
        <td><button class="remove-item" data-idx="${idx}">Remove</button></td>
      `;
      cartTableBody.appendChild(tr);
    });

    // append totals row
    const trTotal = document.createElement('tr');
    trTotal.innerHTML = `
      <td colspan="3" style="text-align:right;font-weight:bold">Subtotal</td>
      <td colspan="2" style="text-align:left;font-weight:bold">${formatMoney(calcTotals())}</td>
    `;
    cartTableBody.appendChild(trTotal);

    attachCartEvents();
  }

  function attachCartEvents() {
    document.querySelectorAll('.qty-input').forEach(input => {
      input.removeEventListener('change', qtyChangeHandler);
      input.addEventListener('change', qtyChangeHandler);
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.removeEventListener('click', removeHandler);
      btn.addEventListener('click', removeHandler);
    });
  }

  function qtyChangeHandler(e) {
    const idx = parseInt(e.target.dataset.idx);
    const val = Math.max(1, parseInt(e.target.value || 1));
    cart[idx].qty = val;
    saveCart();
    renderCart();
  }

  function removeHandler(e) {
    const idx = parseInt(e.target.dataset.idx);
    cart.splice(idx, 1);
    saveCart();
    renderCart();
  }

  // Next-step buttons
  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Basic validation for steps 2 & 3
      if (currentStep === 1 && cart.length === 0) {
        alert('Your cart is empty.');
        return;
      }
      if (currentStep === 2) {
        // shipping validation
        const sf = document.getElementById('shipping-form');
        if (sf) {
          if (![...sf.elements].every(el => (el.type === 'button' || el.type === 'submit' || el.required === false) ? true : !!el.value)) {
            alert('Please fill shipping details.');
            return;
          }
        }
      }
      if (currentStep === 3) {
        const pf = document.getElementById('payment-form');
        if (pf) {
          if (![...pf.elements].every(el => (el.type === 'button' || el.type === 'submit' || el.required === false) ? true : !!el.value)) {
            alert('Please fill payment details.');
            return;
          }
        }
      }

      // move forward
      if (currentStep < totalSteps) {
        stepContents[currentStep - 1].style.display = 'none';
        steps[currentStep - 1].classList.remove('active');
        currentStep++;
        stepContents[currentStep - 1].style.display = 'block';
        steps[currentStep - 1].classList.add('active');

        // When moving to confirmation step, generate order summary
        if (currentStep === 4) {
          // generate order number
          const orderNum = '#' + Math.floor(Math.random() * 900000 + 100000);
          if (orderNumElem) orderNumElem.innerText = orderNum;
          // simple "process order" simulation: clear cart after showing confirmation
          // BUT clear cart after a brief delay to allow user to copy order number
          setTimeout(() => {
            cart = [];
            saveCart();
            // update any UI counts via Puys
            if (window.Puys && typeof window.Puys.updateCartCountUI === 'function') window.Puys.updateCartCountUI();
          }, 800);
        }
      }
    });
  });

  // initial render
  renderCart();

  // expose for debug if needed
  window.PuysCheckout = { renderCart, getCart: () => cart };
});
