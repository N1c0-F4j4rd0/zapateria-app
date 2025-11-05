const fmt = (n) => n.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

let ALL_PRODUCTS = [];

async function fetchProducts() {
  const res = await fetch('/api/products');
  ALL_PRODUCTS = await res.json();
}

function getFilters() {
  // desktop
  const name = document.getElementById('search-name')?.value?.trim().toLowerCase() || '';
  const min  = Number(document.getElementById('search-min')?.value || 0);
  const max  = Number(document.getElementById('search-max')?.value || 0);

  // mobile (prioridad si hay valores)
  const nameM = document.getElementById('search-name-m')?.value?.trim().toLowerCase() || '';
  const minM  = Number(document.getElementById('search-min-m')?.value || 0);
  const maxM  = Number(document.getElementById('search-max-m')?.value || 0);

  return {
    name: nameM || name,
    min: minM || min,
    max: maxM || max
  };
}

function filterProducts() {
  const { name, min, max } = getFilters();
  return ALL_PRODUCTS.filter(p => {
    const byName = !name || p.name.toLowerCase().includes(name);
    const byMin  = !min  || p.price >= min;
    const byMax  = !max  || p.price <= max;
    return byName && byMin && byMax;
  });
}

function render(products) {
  const list = document.getElementById('product-list');
  if (!products.length) {
    list.innerHTML = `<div class="col-12"><div class="alert alert-warning">No se encontraron productos con los filtros aplicados.</div></div>`;
    return;
  }
  list.innerHTML = products.map(p => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.name}</h5>
          <p class="text-muted mb-2">${p.description}</p>
          <p class="fw-bold">${fmt(p.price)}</p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-primary" data-id="${p.id}" data-qty="1">Agregar</button>
            <a href="/cart.html" class="btn btn-outline-secondary">Ver carrito</a>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('button[data-id]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const productId = Number(btn.dataset.id);
    const qty = Number(btn.dataset.qty);
    const csrf = await getCSRF();

    const r = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf
      },
      credentials: 'include',
      body: JSON.stringify({ productId, qty })
    });

    if (r.ok) {
      updateCartCount();
      showAddedToast();
    } else {
      const j = await r.json().catch(()=>({}));
      alert(j?.error || 'No se pudo agregar al carrito.');
    }
  });
});
}

async function updateCartCount() {
  const res = await fetch('/api/cart');
  const cart = await res.json();
  const count = cart.reduce((acc, i) => acc + i.qty, 0);
  document.getElementById('cart-count').textContent = String(count);
}

let CSRF = null;
async function getCSRF() {
  if (CSRF) return CSRF;
  const r = await fetch('/api/csrf-token', { credentials: 'include' });
  CSRF = (await r.json()).csrfToken;
  return CSRF;
}


function bindFilters() {
  ['search-name','search-min','search-max','search-name-m','search-min-m','search-max-m']
    .forEach(id => document.getElementById(id)?.addEventListener('input', () => render(filterProducts())));

  document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
    ['search-name','search-min','search-max'].forEach(id => { const el = document.getElementById(id); if (el) el.value = '' });
    render(filterProducts());
  });
  document.getElementById('btn-clear-filters-m')?.addEventListener('click', () => {
    ['search-name-m','search-min-m','search-max-m'].forEach(id => { const el = document.getElementById(id); if (el) el.value = '' });
    render(filterProducts());
  });
}

// Toast Bootstrap “Producto agregado…”
function showAddedToast() {
  const el = document.getElementById('toast-added');
  if (!el) return;
  const toast = new bootstrap.Toast(el, { delay: 2200 });
  toast.show();
}

(async function init(){
  await fetchProducts();
  bindFilters();
  render(filterProducts());
  updateCartCount();
})();
