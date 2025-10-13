// ======= CART SYSTEM =======
function getCart(){
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function addToCart(name, price){
  const cart = getCart();
  cart.push({name, price, qty:1});
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(`${name} added to cart!`);
}

function updateCartCount(){
  const cart = getCart();
  document.getElementById('cart-count').textContent = cart.length;
}

// ======= NAVIGATION HELPERS =======
function goHome(){
  window.location.href = 'index.html';
}
