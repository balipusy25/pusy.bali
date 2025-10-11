/* ----------------- CART & PRODUCTS ----------------- */
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count
function updateCartCount() {
  document.getElementById('cart-count').textContent = cart.length;
}
updateCartCount();

// Add product to cart
function addToCart(product) {
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Populate homepage new products
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
    card.querySelector('.add-cart-btn').addEventListener('click', ()=>{
      addToCart({name:`Product ${i}`, price:(Math.random()*50+10).toFixed(2)});
    });
    newProductsSection.appendChild(card);
  }
}

// Populate collections page
const collectionGrid = document.getElementById('collection-grid');
if(collectionGrid){
  const categorySelected = localStorage.getItem('category') || 'all';
  for(let i=1;i<=12;i++){
    let catArr = ['new','bottoms','tanks','accessories'];
    let cat = catArr[i%4];
    if(categorySelected!=='all' && categorySelected!==cat) continue;
    const card = document.createElement('div');
    card.className='product-card';
    card.innerHTML = `
      <img src="assets/pic${i%8+1}.jpg" alt="Product ${i}">
      <p>Product ${i}</p>
      <button class="add-cart-btn">Add to Cart</button>
    `;
    card.querySelector('.add-cart-btn').addEventListener('click',()=>{
      addToCart({name:`Product ${i}`, price:(Math.random()*50+10).toFixed(2)});
    });
    collectionGrid.appendChild(card);
  }
}

// CART PAGE
const cartItemsDiv = document.getElementById('cart-items');
const cartTotalDiv = document.getElementById('cart-total');
if(cartItemsDiv){
  cart.forEach((item,index)=>{
    const div=document.createElement('div');
    div.className='cart-item';
    div.innerHTML=`
      <img src="assets/pic${(index%8)+1}.jpg" alt="${item.name}">
      <span>${item.name}</span>
      <span>$${item.price}</span>
      <button class="remove-btn">Remove</button>
    `;
    div.querySelector('.remove-btn').addEventListener('click',()=>{
      cart.splice(index,1);
      localStorage.setItem('cart',JSON.stringify(cart));
      location.reload();
    });
    cartItemsDiv.appendChild(div);
  });
  let total = cart.reduce((acc,item)=>acc+parseFloat(item.price),0).toFixed(2);
  if(cartTotalDiv) cartTotalDiv.textContent = total;
  localStorage.setItem('cartTotal', total);
}

/* ----------------- SEARCH PANEL ----------------- */
const searchIcon = document.getElementById('search-icon');
const searchPanel = document.getElementById('search-panel');
const closeSearch = document.getElementById('close-search');
if(searchIcon && searchPanel){
  searchIcon.addEventListener('click',()=>searchPanel.style.display='block');
  closeSearch.addEventListener('click',()=>searchPanel.style.display='none');
}

/* ----------------- CATEGORY FILTER ----------------- */
const categoryBtns = document.querySelectorAll('.category');
categoryBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{
    localStorage.setItem('category', btn.dataset.cat);
    window.location.href='collections.html';
  });
});

/* ----------------- FILTER & SORT ON COLLECTIONS PAGE ----------------- */
const categoryFilter = document.getElementById('category-filter');
const sortFilter = document.getElementById('sort-filter');
if(categoryFilter){
  categoryFilter.addEventListener('change',()=>location.reload());
}
if(sortFilter){
  sortFilter.addEventListener('change',()=>location.reload());
}

/* ----------------- LOGIN & SIGNUP (FRONT-END PLACEHOLDER) ----------------- */
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
if(loginForm){
  loginForm.addEventListener('submit', e=>{
    e.preventDefault();
    alert('Logged in successfully!');
  });
}
if(signupForm){
  signupForm.addEventListener('submit', e=>{
    e.preventDefault();
    alert('Signed up successfully!');
  });
}
