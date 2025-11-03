const fmt = (n) => n.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

// Variables globales para los productos y filtros
let allProducts = [];
let currentFilters = {
  searchTerm: '',
  maxPrice: 500000
};

// Cargar productos
async function loadProducts() {
  const res = await fetch('/api/products');
  allProducts = await res.json();
  applyFilters();
  setupEventListeners();
  updateCartCount();
}

// Configurar event listeners para los filtros
function setupEventListeners() {
  // Filtro de búsqueda por nombre
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    currentFilters.searchTerm = e.target.value.toLowerCase().trim();
    applyFilters();
  });

  // Filtro por rango de precios
  const priceRange = document.getElementById('price-range');
  const priceValue = document.getElementById('price-value');
  
  priceRange.addEventListener('input', (e) => {
    const price = parseInt(e.target.value);
    currentFilters.maxPrice = price;
    priceValue.textContent = fmt(price);
    applyFilters();
  });

  // Botón para limpiar filtros
  document.getElementById('clear-filters').addEventListener('click', () => {
    clearFilters();
  });
}

// Aplicar filtros a los productos
function applyFilters() {
  const filteredProducts = allProducts.filter(product => {
    // Filtro por nombre (búsqueda)
    const matchesSearch = currentFilters.searchTerm === '' || 
                         product.name.toLowerCase().includes(currentFilters.searchTerm) ||
                         product.description.toLowerCase().includes(currentFilters.searchTerm);
    
    // Filtro por precio
    const matchesPrice = product.price <= currentFilters.maxPrice;
    
    return matchesSearch && matchesPrice;
  });
  
  renderProducts(filteredProducts);
}

// Limpiar todos los filtros
function clearFilters() {
  currentFilters.searchTerm = '';
  currentFilters.maxPrice = 500000;
  
  // Resetear valores de los inputs
  document.getElementById('search-input').value = '';
  document.getElementById('price-range').value = '500000';
  document.getElementById('price-value').textContent = fmt(500000);
  
  applyFilters();
}

// Renderizar productos en el DOM
function renderProducts(products) {
  const list = document.getElementById('product-list');
  
  if (products.length === 0) {
    list.innerHTML = `
      <div class="col-12 text-center py-5">
        <h4 class="text-muted">No se encontraron productos</h4>
        <p class="text-muted">Intenta con otros términos de búsqueda o ajusta el filtro de precio.</p>
        <button class="btn btn-primary" onclick="clearFilters()">Limpiar filtros</button>
      </div>
    `;
    return;
  }
  
  list.innerHTML = products.map(p => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.name}</h5>
          <p class="text-muted mb-2">${p.description}</p>
          <p class="fw-bold text-success">${fmt(p.price)}</p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-primary" data-id="${p.id}" data-qty="1">Agregar</button>
            <a href="/cart.html" class="btn btn-outline-secondary">Ver carrito</a>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Agregar event listeners a los botones
  list.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = Number(btn.dataset.id);
      const qty = Number(btn.dataset.qty);
      await addToCart(productId, qty);
    });
  });
}

// Función para agregar al carrito
async function addToCart(productId, qty) {
  await fetch('/api/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, qty })
  });
  updateCartCount();
  
  // Mostrar notificación (opcional)
  showNotification('Producto agregado al carrito', 'success');
}

// Actualizar contador del carrito
async function updateCartCount() {
  const res = await fetch('/api/cart');
  const cart = await res.json();
  const count = cart.reduce((acc, i) => acc + i.qty, 0);
  document.getElementById('cart-count').textContent = String(count);
}

// Notificación temporal (bonus)
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
  notification.innerHTML = `
    <strong>${type === 'success' ? '✓' : '⚠'}</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Inicializar la aplicación
loadProducts();