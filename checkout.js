// checkout.js

document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.querySelector('#checkoutForm');
  const summary = document.querySelector('#orderSummary');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Render order summary
  if (summary) {
    summary.innerHTML = cart
      .map(
        (item) => `
        <div class="summary-item">
          <img src="${item.image}" alt="${item.name}">
          <p>${item.name}</p>
          <span>$${item.price}</span>
        </div>
      `
      )
      .join('');
  }

  // Payment Simulation
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = e.target.name.value;
      const address = e.target.address.value;
      const card = e.target.card.value;
      const method = e.target.paymentMethod.value;

      if (!name || !address || !card) {
        alert('Please fill in all details.');
        return;
      }

      // Simulated Payment Gateway
      setTimeout(() => {
        alert(`Payment successful via ${method.toUpperCase()}!`);
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
      }, 2000);
    });
  }
});
