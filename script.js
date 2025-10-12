// ------------------------------
// CART FUNCTIONALITY
// ------------------------------
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product) {
    cartItems.push(product);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCount();
    alert(`${product.name} added to cart!`);
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    renderCart();
    updateCartCount();
}

function updateCartCount() {
    const countEl = document.querySelectorAll('.cart-count');
    countEl.forEach(el => el.textContent = cartItems.length);
}

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;
    container.innerHTML = '';
    let total = 0;
    cartItems.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'summary-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <p>${item.name}</p>
            <p>$${item.price.toFixed(2)}</p>
            <input type="number" min="1" value="1" onchange="updateQuantity(${index}, this.value)">
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        container.appendChild(div);
    });
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

function updateQuantity(index, qty) {
    qty = parseInt(qty);
    if (qty < 1) qty = 1;
    cartItems[index].price = cartItems[index].price / 1 * qty;
    localStorage.setItem('cart', JSON.stringify(cartItems));
    renderCart();
}

// ------------------------------
// SEARCH FUNCTIONALITY
// ------------------------------
const products = [
    {name: 'Tank 1', price: 49.99, image:'assets/pic1.jpg', category:'tanks'},
    {name: 'Bottom 1', price: 59.99, image:'assets/pic2.jpg', category:'bottoms'},
    {name: 'Gym 1', price: 39.99, image:'assets/pic3.jpg', category:'gym'},
    {name: 'New Arrival 1', price: 29.99, image:'assets/pic4.jpg', category:'new'},
    {name: 'Tank 2', price: 45.99, image:'assets/pic5.jpg', category:'tanks'},
    {name: 'Bottom 2', price: 55.99, image:'assets/pic6.jpg', category:'bottoms'}
];

function renderResults(results, containerId='searchResults') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (results.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }
    results.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>$${product.price.toFixed(2)}</p>
            <button onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
        `;
        container.appendChild(card);
    });
}

// ------------------------------
// INIT
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(query));
            renderResults(filtered);
        });
    }
});
