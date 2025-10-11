/* script.js
   - Hero slider
   - Search + filters for collections
   - Add-to-cart + persistent cart (localStorage: 'puysCart')
   - Click product -> save selected product (localStorage: 'puysSelected') -> redirect to product.html
   - Update cart count everywhere
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Utilities ---------- */
  const readCart = () => JSON.parse(localStorage.getItem('puysCart') || '[]');
  const writeCart = (c) => { localStorage.setItem('puysCart', JSON.stringify(c)); updateCartCount(); };
  const formatPrice = v => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : Math.round(n*100)/100;
  };

  /* ---------- Cart Count ---------- */
  function updateCartCount() {
    const total = readCart().reduce((s,i)=>s + (i.qty||0), 0);
    document.querySelectorAll('.cart-icon').forEach(el => el.setAttribute('data-count', total));
  }

  updateCartCount(); // initial

  /* ---------- HERO SLIDER ---------- */
  (function heroSlider(){
    const slides = Array.from(document.querySelectorAll('.hero-slider .slide'));
    if(!slides.length) return;
    let idx = slides.findIndex(s=>s.classList.contains('active'));
    if(idx < 0) idx = 0;
    const show = i => {
      slides.forEach(s=>s.classList.remove('active'));
      slides[i].classList.add('active');
    };
    show(idx);
    const nextBtn = document.querySelector('.hero-slider .next');
    const prevBtn = document.querySelector('.hero-slider .prev');
    if(nextBtn) nextBtn.addEventListener('click', ()=> { idx = (idx+1) % slides.length; show(idx); });
    if(prevBtn) prevBtn.addEventListener('click', ()=> { idx = (idx-1+slides.length) % slides.length; show(idx); });

    // Auto-advance every 6s
    setInterval(()=> { idx = (idx+1)%slides.length; show(idx); }, 6000);
  })();

  /* ---------- SEARCH + FILTERS (Collections) ---------- */
  const filters = {
    category: document.getElementById('filter-category'),
    size: document.getElementById('filter-size'),
    color: document.getElementById('filter-color'),
    price: document.getElementById('filter-price'),
    search: document.getElementById('search-input')
  };

  const productNodes = () => Array.from(document.querySelectorAll('.collection-grid .product-item, .products-grid .product-item'));

  function matchesPriceRange(priceValue, rangeVal) {
    const price = parseFloat(priceValue) || 0;
    if(!rangeVal || rangeVal === 'all') return true;
    if(rangeVal === '0-50') return price <= 50;
    if(rangeVal === '51-100') return price >=51 && price <=100;
    // add more cases if needed
    return true;
  }

  function applyFilters() {
    const nodes = productNodes();
    if(!nodes.length) return;
    const cat = filters.category ? filters.category.value : 'all';
    const size = filters.size ? filters.size.value : 'all';
    const color = filters.color ? filters.color.value : 'all';
    const price = filters.price ? filters.price.value : 'all';
    const search = filters.search ? (filters.search.value || '').trim().toLowerCase() : '';

    nodes.forEach(n => {
      const name = (n.querySelector('h3')?.innerText || '').toLowerCase();
      const dataCat = n.dataset.category || '';
      const dataSize = n.dataset.size || '';
      const dataColor = n.dataset.color || '';
      const dataPrice = n.dataset.price || n.querySelector('p')?.innerText || '0';

      let visible = true;
      if(cat !== 'all' && dataCat !== cat) visible = false;
      if(size !== 'all' && dataSize !== size) visible = false;
      if(color !== 'all' && dataColor !== color) visible = false;
      if(!matchesPriceRange(dataPrice, price)) visible = false;
      if(search && !name.includes(search)) visible = false;

      n.style.display = visible ? '' : 'none';
    });
    updateCartCount();
  }

  ['change','input'].forEach(ev => {
    Object.values(filters).forEach(el => {
      if(!el) return;
      el.addEventListener(ev, () => {
        // debounce short
        if(window._puys_filter_timeout) clearTimeout(window._puys_filter_timeout);
        window._puys_filter_timeout = setTimeout(applyFilters, 120);
      });
    });
  });

  /* ---------- ADD TO CART & PRODUCT NAV ---------- */
  function addToCart(product) {
    const cart = readCart();
    const existing = cart.find(p=>p.id === product.id && p.price === product.price);
    if(existing) { existing.qty = (existing.qty||0) + (product.qty||1); }
    else { cart.push(Object.assign({qty: product.qty||1}, product)); }
    writeCart(cart);
  }

  // attach to existing add-to-cart buttons
  function attachAddToCartButtons() {
    const addBtns = Array.from(document.querySelectorAll('.add-to-cart'));
    addBtns.forEach(btn => {
      if(btn.dataset.puysBound) return;
      btn.dataset.puysBound = '1';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        // find nearest .product-item
        const item = btn.closest('.product-item');
        if(!item) return alert('Product data not found.');
        const name = item.querySelector('h3')?.innerText?.trim() || 'Product';
        const priceRaw = item.querySelector('p')?.innerText?.replace('$','').trim() || item.dataset.price || '0';
        const price = formatPrice(priceRaw);
        const img = item.querySelector('img')?.getAttribute('src') || '';
        // create a simple id (safe): use name + price + img
        const id = btoa(name + '|' + price + '|' + img).slice(0,24);
        addToCart({ id, name, price, qty:1, img });
        // small friendly UI feedback
        btn.innerText = 'Added ✓';
        setTimeout(()=> btn.innerText = 'Add to Cart', 900);
      });
    });
  }

  attachAddToCartButtons();

  // click product to view - save selected product in localStorage and go to product page
  function attachProductViewLinks(){
    productNodes().forEach(item => {
      if(item.dataset.puysViewBound) return;
      item.dataset.puysViewBound = '1';
      // create click handler on image/title
      const clickTargets = [item.querySelector('img'), item.querySelector('h3')].filter(Boolean);
      clickTargets.forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const name = item.querySelector('h3')?.innerText?.trim() || 'Product';
          const priceRaw = item.querySelector('p')?.innerText?.replace('$','').trim() || item.dataset.price || '0';
          const price = formatPrice(priceRaw);
          const img = item.querySelector('img')?.getAttribute('src') || '';
          const selected = {
            id: btoa(name + '|' + price + '|' + img).slice(0,24),
            name, price, img,
            size: item.dataset.size || '',
            color: item.dataset.color || ''
          };
          localStorage.setItem('puysSelected', JSON.stringify(selected));
          window.location.href = 'product.html';
        });
      });
    });
  }

  attachProductViewLinks();

  /* ---------- PRODUCT PAGE: load selected product ---------- */
  (function productPageInit(){
    if(!document.querySelector('.product-detail')) return;
    const selected = JSON.parse(localStorage.getItem('puysSelected') || 'null');
    if(selected) {
      // populate page fields
      const title = document.querySelector('.product-info h2');
      const priceEl = document.querySelector('.product-info p');
      const imgs = document.querySelectorAll('.product-images img');
      if(title) title.innerText = selected.name;
      if(priceEl) priceEl.innerText = '$' + selected.price;
      if(imgs && imgs.length) {
        imgs.forEach((img,i) => {
          if(i===0) img.src = selected.img || imgs[i].src;
        });
      }
    }
    // product page add-to-cart button behavior
    const pageAdd = document.querySelector('.product-info .add-to-cart');
    if(pageAdd && !pageAdd.dataset.puysBound){
      pageAdd.dataset.puysBound = '1';
      pageAdd.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLocal = JSON.parse(localStorage.getItem('puysSelected') || 'null');
        if(!selectedLocal) return alert('No product selected.');
        const qty = parseInt(document.querySelector('.product-info .qty-input')?.value || '1');
        addToCart({ id: selectedLocal.id, name: selectedLocal.name, price: selectedLocal.price, qty, img: selectedLocal.img });
        // friendly feedback
        pageAdd.innerText = 'Added ✓';
        setTimeout(()=> pageAdd.innerText = 'Add to Cart', 900);
      });
    }
  })();

  /* ---------- Watch DOM changes (for SPA-like additions) ---------- */
  const obs = new MutationObserver(() => { attachAddToCartButtons(); attachProductViewLinks(); });
  obs.observe(document.body, { childList: true, subtree: true });

  /* ---------- make sure cart-count updates everywhere if storage changed (multiple tabs) ---------- */
  window.addEventListener('storage', (e) => {
    if(e.key === 'puysCart') updateCartCount();
  });
});
