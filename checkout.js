/* checkout.js
   - Renders cart on cart.html
   - Quantity changes, remove item
   - Multi-step navigation (Cart -> Shipping -> Payment -> Confirmation)
   - Generates order number and clears cart on confirmation
*/

document.addEventListener('DOMContentLoaded', () => {
  const readCart = () => JSON.parse(localStorage.getItem('puysCart') || '[]');
  const writeCart = (c) => localStorage.setItem('puysCart', JSON.stringify(c));
  let cart = readCart();

  // DOM refs
  const cartTableBody = document.querySelector('.cart-table tbody');
  const steps = Array.from(document.querySelectorAll('.step'));
  const stepContents = Array.from(document.querySelectorAll('.step-content'));
  const nextButtons = Array.from(document.querySelectorAll('.next-step-btn'));
  const orderNumElem = document.getElementById('order-number');

  function currency(v){ return '$' + (Math.round((v||0)*100)/100).toFixed(2); }

  function renderCart() {
    if(!cartTableBody) return;
    cart = readCart();
    cartTableBody.innerHTML = '';
    if(cart.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="5">Your cart is empty.</td>`;
      cartTableBody.appendChild(tr);
      return;
    }
    cart.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.dataset.index = idx;
      tr.innerHTML = `
        <td style="text-align:left">
          <div style="display:flex; gap:10px; align-items:center;">
            <img src="${item.img || ''}" alt="" style="width:60px;height:60px;object-fit:cover;border:1px solid #ddd;">
            <div>
              <div style="font-weight:600">${item.name}</div>
            </div>
          </div>
        </td>
        <td>${currency(item.price)}</td>
        <td><input type="number" class="qty-input" value="${item.qty}" min="1" data-idx="${idx}"></td>
        <td class="total-price">${currency(item.price * item.qty)}</td>
        <td
