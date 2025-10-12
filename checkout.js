// ------------------------------
// CHECKOUT FUNCTIONALITY
// ------------------------------
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// RENDER CHECKOUT ITEMS
function renderCheckout() {
    const container = document.getElementById('checkoutItems');
    if (!container) return;

    container.innerHTML = '';
    let total = 0;

    cartItems.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'checkout-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="checkout-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)}</p>
                <input type="number" min="1" value="1" onchange="updateQuantity(${index}, this.value)">
                <button onclick="removeFromCheckout(${index})">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });

    const totalEl = document.getElementById('checkoutTotal');
    if (totalEl) totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

// UPDATE QUANTITY
function updateQuantity(index, qty) {
    qty = parseInt(qty);
    if (qty < 1) qty = 1;
    // Adjust price based on quantity (assuming base price is stored)
    const basePrice = JSON.parse(localStorage.getItem('cartBasePrices'))?.[index] || cartItems[index].price;
    cartItems[index].price = basePrice * qty;
    localStorage.setItem('cart', JSON.stringify(cartItems));
    renderCheckout();
    updateCartCount();
}

// REMOVE ITEM
function removeFromCheckout(index) {
    cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    renderCheckout();
    updateCartCount();
}

// FINALIZE PAYMENT (simulated)
function completePayment() {
    if (cartItems.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    alert('Payment successful! Thank you for your order.');
    cartItems = [];
    localStorage.removeItem('cart');
    localStorage.removeItem('cartBasePrices');
    renderCheckout();
    updateCartCount();
    window.location.href = 'index.html';
}

// CART COUNT (shared with script.js)
function updateCartCount() {
    const countEl = document.querySelectorAll('.cart-count');
    countEl.forEach(el => el.textContent = cartItems.length);
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
    renderCheckout();
    updateCartCount();

    const payBtn = document.getElementById('payBtn');
    if (payBtn) payBtn.addEventListener('click', completePayment);
});
