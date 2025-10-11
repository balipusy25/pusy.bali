// CART & PRODUCTS
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Populate cart count
function updateCartCount() {
  document.getElementById('cart-count').textContent = cart.length;
}
updateCartCount();

// Add to cart
function addToCart(product) {
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Populate products in homepage
const newProductsSection = document.getElementById('new-products');
if(newProductsSection){
  for(let i=1;i<=8;i++){
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="assets/pic${i}.jpg" alt="Product ${i}">
      <p>Product ${i}</p>
      <button class="add-cart-btn">Add to Cart</button>
    `;
    newProductsSection.appendChild(card);
    card.querySelector('.add-cart-btn').addEventListener('click', ()=>{
      addToCart({name:`Product ${i}`, price: (Math.random()*50+10).toFixed(2)});
    });
  }
}

// Populate collection page
const collectionGrid = document.getElementById('collection-grid');
if(collectionGrid){
  for(let i=1;i<=12;i++){
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="assets/pic${i%8+1}.jpg" alt="Product ${i}">
      <p>Product ${i}</p>
      <button class="add-cart-btn">Add to Cart</button>
    `;
    collectionGrid.appendChild(card);
    card.querySelector('.add-cart-btn').addEventListener('click', ()=>{
      addToCart({name:`Product ${i}`, price: (Math.random()*50+10).toFixed(2)});
    });
  }
}

// CART PAGE
const cartItemsDiv = document.getElementById('cart-items');
const cartTotalDiv = document.getElementById('cart-total');
if(cartItemsDiv){
  cart.forEach((item,index)=>{
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="assets/pic${(index%8)+1}.jpg" alt="${item.name}">
      <span>${item.name}</span>
      <span>$${item.price}</span>
      <button class="remove-btn">Remove</button>
    `;
    div.querySelector('.remove-btn').addEventListener('click', ()=>{
      cart.splice(index,1);
      localStorage.setItem('cart', JSON.stringify(cart));
      location.reload();
    });
    cartItemsDiv.appendChild(div);
  });
  let total = cart.reduce((acc,item)=>acc+parseFloat(item.price),0).toFixed(2);
  cartTotalDiv.textContent = total;
}

// SEARCH PANEL
const searchIcon = document.getElementById('search-icon');
const searchPanel = document.getElementById('search-panel');
const closeSearch = document.getElementById('close-search');
if(searchIcon && searchPanel){
  searchIcon.addEventListener('click',()=>searchPanel.style.display='block');
  closeSearch.addEventListener('click',()=>searchPanel.style.display='none');
}

// CATEGORY FILTER
const categoryBtns = document.querySelectorAll('.category');
categoryBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{
    localStorage.setItem('category', btn.dataset.cat);
    window.location.href = 'collections.html';
  });
});
