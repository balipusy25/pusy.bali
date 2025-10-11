/* HERO SLIDER */
let slideIndex = 0;
function showSlides() {
  const slides = document.querySelectorAll(".slide");
  slides.forEach(s => s.classList.remove("active"));
  slides[slideIndex].classList.add("active");
  slideIndex = (slideIndex + 1) % slides.length;
  setTimeout(showSlides, 4000);
}
showSlides();

/* SEARCH SLIDE */
document.getElementById("search-icon").addEventListener("click", () => {
  document.getElementById("search-slide").classList.remove("hidden");
});
document.querySelectorAll("#search-close").forEach(btn=>{
  btn.addEventListener("click", () => {
    btn.parentElement.classList.add("hidden");
  });
});

/* CART LOGIC */
let cart = JSON.parse(localStorage.getItem("cart")) || [];
function addToCart(id) {
  let item = cart.find(i => i.id === id);
  if(item){ item.qty +=1; } else { cart.push({id, qty:1}); }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  document.querySelectorAll(".cart-count").forEach(span => {
    span.textContent = cart.reduce((acc,i)=>acc+i.qty,0);
  });
}
updateCartCount();

/* COLLECTION PAGE PRODUCTS */
const products = [
  {id:1,name:"Product 1",price:50,category:"new",img:"assets/pic1.jpg"},
  {id:2,name:"Product 2",price:60,category:"bottoms",img:"assets/pic2.jpg"},
  {id:3,name:"Product 3",price:40,category:"tanks",img:"assets/pic3.jpg"},
  {id:4,name:"Product 4",price:70,category:"accessories",img:"assets/pic4.jpg"}
];

function renderProducts(filter="all") {
  const grid = document.getElementById("products-grid");
  if(!grid) return;
  let filtered = filter==="all"? products : products.filter(p=>p.category===filter);
  grid.innerHTML = "";
  filtered.forEach(p=>{
    let div = document.createElement("div");
    div.className="product-card";
    div.innerHTML=`<img src="${p.img}"><h3>${p.name}</h3><p>$${p.price}</p><button onclick="addToCart(${p.id})">Add to Cart</button>`;
    grid.appendChild(div);
  });
}
function filterProducts(){
  let cat = document.getElementById("category-filter").value;
  renderProducts(cat);
}
function sortProducts(){
  let sort = document.getElementById("sort-filter").value;
  let sorted = [...products];
  if(sort==="price-asc") sorted.sort((a,b)=>a.price-b.price);
  else if(sort==="price-desc") sorted.sort((a,b)=>b.price-a.price);
  else if(sort==="name-asc") sorted.sort((a,b)=>a.name.localeCompare(b.name));
  else if(sort==="name-desc") sorted.sort((a,b)=>b.name.localeCompare(a.name));
  renderProducts("all");
}
renderProducts();

/* CART PAGE */
function renderCart(){
  const container = document.getElementById("cart-items");
  const summary = document.getElementById("cart-summary");
  if(!container) return;
  container.innerHTML="";
  let total=0;
  cart.forEach(c=>{
    let p = products.find(pr=>pr.id===c.id);
    total+=p.price*c.qty;
    let div = document.createElement("div");
    div.className="cart-item";
    div.innerHTML=`<span>${p.name}</span><input type="number" value="${c.qty}" min="1" onchange="updateQty(${c.id},this.value)"><span>$${p.price*c.qty}</span><button onclick="removeFromCart(${c.id})">X</button>`;
    container.appendChild(div);
  });
  if(summary) summary.innerHTML=`<h3>Total: $${total}</h3><button onclick="location.href='checkout.html'">Proceed to Checkout</button>`;
}
function updateQty(id,val){ let item=cart.find(c=>c.id===id); item.qty=+val; localStorage.setItem("cart",JSON.stringify(cart)); renderCart(); updateCartCount(); }
function removeFromCart(id){ cart=cart.filter(c=>c.id!==id); localStorage.setItem("cart",JSON.stringify(cart)); renderCart(); updateCartCount(); }
renderCart();

/* LOGIN / SIGNUP TAB */
function showTab(tab){
  document.getElementById("login-form").classList.toggle("hidden", tab!=="login");
  document.getElementById("signup-form").classList.toggle("hidden", tab!=="signup");
}

/* PROFILE PAGE */
function saveProfile(){
  alert("Profile saved (demo)");
}

/* CHECKOUT PAYPAL MOCK */
function finalizeCreditCardOrder(){
  alert("Credit Card Payment Successful (demo)");
}
function finalizeOrderDemo(details){
  alert("PayPal Payment Successful (demo)");
}

/* SIMPLE FILTER COLLECTION FROM INDEX */
function filterCollection(cat){ localStorage.setItem("filterCategory",cat); location.href="collections.html"; }
