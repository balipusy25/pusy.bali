// checkout.js
import { auth, db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checkout-form');
  const cart = JSON.parse(localStorage.getItem('puys_cart_v1') || '[]');

  // Render order summary if present
  const orderSummary = document.getElementById('order-summary');
  if (orderSummary) {
    if (cart.length === 0) orderSummary.innerHTML = '<p>Your cart is empty</p>';
    else {
      orderSummary.innerHTML = cart.map(it => `
        <div class="summary-item">
          <img src="${it.image || 'assets/pic1.jpg'}" alt="${it.name}">
          <div><strong>${it.name}</strong><div>$${Number(it.price).toFixed(2)} x ${it.qty || 1}</div></div>
        </div>
      `).join('');
    }
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.length === 0) { alert('Cart empty'); return; }

    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const address = form.querySelector('input[name="address"]').value.trim();
    const city = form.querySelector('input[name="city"]').value.trim();
    const postal = form.querySelector('input[name="postal"]').value.trim();
    const paymentMethod = form.querySelector('select[name="paymentMethod"]').value;

    // Create order object
    const order = {
      customerName: name,
      customerEmail: email,
      address: { address, city, postal },
      paymentMethod,
      items: cart,
      total: cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0),
      createdAt: serverTimestamp()
    };

    try {
      // Save order to Firestore (collection: orders)
      const docRef = await addDoc(collection(db, 'orders'), order);
      // Clear cart on success
      localStorage.removeItem('puys_cart_v1');
      if (window.updateCartCount) window.updateCartCount();
      alert('Order placed! Order ID: ' + docRef.id);
      window.location.href = 'success.html?order=' + docRef.id;
    } catch (err) {
      console.error('Order save error:', err);
      alert('Failed to place order: ' + (err.message || err));
    }
  });
});
