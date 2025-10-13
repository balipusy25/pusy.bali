let cart = JSON.parse(localStorage.getItem('cart')) || [];
updateCartCount();

export function addToCart(name, price){
  cart.push({name, price, quantity:1});
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

export function updateCartCount(){
  const el = document.getElementById('cart-count');
  if(el) el.textContent = cart.length;
}

export function goToCollections(){
  window.location.href = 'collections.html';
}

export function filterCategory(category){
  localStorage.setItem('filter', category);
  window.location.href = 'collections.html';
}

export function goToCheckout(){
  window.location.href = 'checkout.html';
}

export function goHome(){
  window.location.href = 'index.html';
}

// Search handling
document.addEventListener('DOMContentLoaded',()=>{
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  if(searchBtn){
    searchBtn.addEventListener('click',()=>{
      const query = searchInput.value.trim();
      if(query){
        localStorage.setItem('searchQuery', query);
        window.location.href = 'search.html';
      }
    });
  }

  // Populate search results
  const searchResultsDiv = document.getElementById('search-results');
  if(searchResultsDiv){
    const query = localStorage.getItem('searchQuery') || '';
    const products = JSON.parse(localStorage.getItem('products')) || [
      {name:'Product 1', img:'assets/pic2.png', price:49.99},
      {name:'Product 2', img:'assets/pic3.png', price:59.99},
      {name:'Gym Tank', img:'assets/pic4.png', price:39.99},
      {name:'Yoga Bottoms', img:'assets/pic5.png', price:44.99}
    ];
    const results = products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase()));
    if(results.length===0){
      searchResultsDiv.innerHTML='<p>No products found.</p>';
    } else {
      results.forEach(product=>{
        const div = document.createElement('div');
        div.classList.add('product');
        div.innerHTML=`<img src="${product.img}" alt="${product.name}">
          <p>${product.name}</p>
          <p>$${product.price}</p>
          <button onclick="addToCart('${product.name}',${product.price})">Add to Cart</button>`;
        searchResultsDiv.appendChild(div);
      });
    }
  }
});
