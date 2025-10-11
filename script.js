/* HERO SLIDER */
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

function showSlide(index){
    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');
}

if(nextBtn && prevBtn && slides.length){
    nextBtn.addEventListener('click', () => { slideIndex = (slideIndex+1)%slides.length; showSlide(slideIndex); });
    prevBtn.addEventListener('click', () => { slideIndex = (slideIndex-1+slides.length)%slides.length; showSlide(slideIndex); });
    showSlide(slideIndex);
}

/* FILTERS */
const categoryFilter = document.getElementById('filter-category');
const sizeFilter = document.getElementById('filter-size');
const colorFilter = document.getElementById('filter-color');
const priceFilter = document.getElementById('filter-price');
const products = document.querySelectorAll('.collection-grid .product-item');

function filterProducts(){
    products.forEach(p => {
        let show = true;
        if(categoryFilter && categoryFilter.value !== 'all' && p.dataset.category !== categoryFilter.value) show=false;
        if(sizeFilter && sizeFilter.value !== 'all' && p.dataset.size !== sizeFilter.value) show=false;
        if(colorFilter && colorFilter.value !== 'all' && p.dataset.color !== colorFilter.value) show=false;
        if(priceFilter && priceFilter.value !== 'all' && p.dataset.price !== priceFilter.value) show=false;
        p.style.display = show ? 'block' : 'none';
    });
}

[categoryFilter, sizeFilter, colorFilter, priceFilter].forEach(f => { if(f) f.addEventListener('change', filterProducts); });

/* CART BUTTONS */
const addToCartBtns = document.querySelectorAll('.add-to-cart');
let cart = JSON.parse(localStorage.getItem('puysCart')) || [];

function saveCart() { localStorage.setItem('puysCart', JSON.stringify(cart)); }

function updateCartCount() {
    const cartIcon = document.querySelector('.cart-icon');
    if(cartIcon) cartIcon.setAttribute('data-count', cart.reduce((a,b)=>a+b.qty,0));
}

addToCartBtns.forEach((btn,index)=>{
    btn.addEventListener('click', ()=>{
        const productItem = btn.closest('.product-item');
        const name = productItem.querySelector('h3').innerText;
        const price = parseFloat(productItem.querySelector('p').innerText);
        const existing = cart.find(p=>p.name===name);
        if(existing){ existing.qty++; } else { cart.push({name,price,qty:1}); }
        saveCart();
        updateCartCount();
        alert('Product added to cart!');
    });
});

updateCartCount();
