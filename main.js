// CART
let cart = [];
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
});

// Add to cart
function addToCart(id) {
  cart.push(id);
  updateCartUI();
}

// Update Cart UI
function updateCartUI() {
  document.querySelectorAll('.cart-count').forEach(span => span.textContent = cart.length);
  if(document.getElementById('cart-items')){
    let cartDiv = document.getElementById('cart-items');
    cartDiv.innerHTML = cart.length === 0 ? "<p>Cart is empty</p>" : cart.map(i => `<div>Product ${i}</div>`).join('');
    if(document.getElementById('cart-summary')) {
      document.getElementById('cart-summary').innerHTML = `<p>Total Items: ${cart.length}</p>`;
    }
  }
}

// HERO SLIDER
let slides = document.querySelectorAll('.hero-slider .slide');
let currentSlide = 0;
setInterval(() => {
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}, 4000);

// SEARCH SLIDE
document.getElementById('search-icon')?.addEventListener('click', () => {
  document.getElementById('search-slide').classList.add('show');
});
document.getElementById('search-close')?.addEventListener('click', () => {
  document.getElementById('search-slide').classList.remove('show');
});

// PRODUCT FILTER / SORT
let productsData = [
  {id:1,name:"Item 1",category:"new",price:50,img:"assets/pic1.jpg"},
  {id:2,name:"Item 2",category:"bottoms",price:35,img:"assets/pic2.jpg"},
  {id:3,name:"Item 3",category:"tanks",price:20,img:"assets/pic3.jpg"},
  {id:4,name:"Item 4",category:"tops",price:45,img:"assets/pic4.jpg"}
];
function filterProducts(cat){
  if(document.getElementById('product-grid')){
    let grid = document.getElementById('product-grid');
    let filtered = cat ? productsData.filter(p=>p.category===cat) : productsData;
    grid.innerHTML = filtered.map(p=>`
      <div class="product-card">
        <img src="${p.img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>$${p.price}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
      </div>`).join('');
  }
}

// OAUTH MOCK
function loginWithGoogle(){alert('Google login (mock)');}
function loginWithFacebook(){alert('Facebook login (mock)');}
function signupWithGoogle(){alert('Google signup (mock)');}
function signupWithFacebook(){alert('Facebook signup (mock)');}

// PROFILE MOCK
function updateProfile(){alert('Profile updated (mock)');}
function addAddress(){alert('Address added (mock)');}

// CHECKOUT MOCK
function finalizeOrderDemo(details){
  alert('Order finalized (mock)');
  location.href = 'success.html';
}
