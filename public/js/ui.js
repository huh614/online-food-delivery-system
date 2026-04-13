/* =============================================
   UI.JS - All rendering and UI interaction
   ============================================= */

// ===== SECTION NAVIGATION =====
function showSection(id) {
    ['home', 'restaurants', 'menu', 'orders'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = (s === id) ? 'block' : 'none';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'restaurants' && state.restaurants.length > 0) renderRestaurants();
    if (id === 'orders') fetchOrders();
}

// ===== RESTAURANTS RENDERING =====
function renderHomeRestaurants() {
    const grid = document.getElementById('home-restaurant-grid');
    if (!grid) return;
    const topFour = [...state.restaurants].sort((a, b) => b.rating - a.rating).slice(0, 4);
    grid.innerHTML = topFour.map(r => restCardHTML(r)).join('');
}

function renderRestaurants() {
    const grid = document.getElementById('restaurant-grid');
    if (!grid) return;
    let filtered = [...state.restaurants];
    
    // Category filter
    if (activeCategoryFilter !== 'all') {
        filtered = filtered.filter(r => r.category === activeCategoryFilter || r.cuisine.toLowerCase().includes(activeCategoryFilter.toLowerCase()));
    }
    
    // Search filter
    const searchVal = (document.getElementById('rest-search')?.value || '').toLowerCase();
    if (searchVal) {
        filtered = filtered.filter(r => r.name.toLowerCase().includes(searchVal) || r.cuisine.toLowerCase().includes(searchVal) || r.location.toLowerCase().includes(searchVal));
    }
    
    // Sort
    if (activeSort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (activeSort === 'delivery') filtered.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
    else if (activeSort === 'cost-low') filtered.sort((a, b) => a.deliveryCost - b.deliveryCost);
    
    document.getElementById('restaurants-count').textContent = `${filtered.length} restaurants found`;
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-3);">
            <div style="font-size:3rem;margin-bottom:1rem;">🔍</div>
            <h3 style="color:var(--text-2);">No restaurants found</h3>
            <p style="margin-top:0.5rem;">Try a different filter or search term</p>
        </div>`;
        return;
    }
    
    grid.innerHTML = filtered.map(r => restCardHTML(r)).join('');
    // Animate cards in
    requestAnimationFrame(() => {
        grid.querySelectorAll('.rest-card').forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 60);
        });
    });
}

function restCardHTML(r) {
    return `
    <div class="rest-card" onclick="viewRestaurant(${r.id}, '${r.name.replace(/'/g,"\\'")}', '${r.rating}', '${r.location.replace(/'/g,"\\'")}')">
        <div class="rest-card-img-wrap">
            <img src="${r.image}" alt="${r.name}" loading="lazy"/>
            ${r.offer ? `<div class="rest-offer-ribbon">${r.offer}</div>` : ''}
            ${r.veg ? '<div class="rest-veg-badge">PURE VEG</div>' : ''}
        </div>
        <div class="rest-card-body">
            <div class="rest-card-header">
                <div class="rest-card-name">${r.name}</div>
                <div class="rest-rating"><i class="fas fa-star" style="font-size:0.7rem;"></i> ${r.rating}</div>
            </div>
            <div class="rest-card-meta">
                <span><i class="fas fa-clock" style="font-size:0.75rem;"></i> ${r.deliveryTime}</span>
                <span class="dot">•</span>
                <span>${r.deliveryCost === 0 ? '<span style="color:#27ae60;font-weight:700;">Free delivery</span>' : '₹' + r.deliveryCost + ' delivery'}</span>
                <span class="dot">•</span>
                <span>Min ₹${r.minOrder}</span>
            </div>
            <div class="rest-card-cuisine">${r.cuisine}</div>
        </div>
    </div>`;
}

function viewRestaurant(id, name, rating, location) {
    state.currentRestaurant = state.restaurants.find(r => r.id === id);
    document.getElementById('restaurant-name-title').textContent = name;
    document.getElementById('rest-rating').textContent = rating;
    document.getElementById('rest-location').textContent = location;
    showSection('menu');
    loadMenu(id);
}

// ===== MENU RENDERING =====
function renderMenu() {
    const menuItems = state.menu;
    const groups = {};
    menuItems.forEach(item => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
    });

    // Sidebar
    const sidebar = document.getElementById('menu-sidebar-links');
    if (sidebar) {
        sidebar.innerHTML = Object.keys(groups).map((cat, i) =>
            `<li class="${i === 0 ? 'active' : ''}" onclick="scrollToMenuGroup('${cat}')">${cat} <span style="color:var(--text-3);font-weight:500;">(${groups[cat].length})</span></li>`
        ).join('');
    }

    // Menu content
    const container = document.getElementById('menu-groups');
    if (!container) return;
    container.innerHTML = Object.entries(groups).map(([cat, items]) => `
        <div class="menu-group" id="mg-${cat.replace(/\s+/g, '-')}">
            <div class="menu-group-title">${cat} <span style="color:var(--text-3);font-size:0.85rem;font-weight:500;">(${items.length})</span></div>
            ${items.map(item => menuItemHTML(item)).join('')}
        </div>
    `).join('');
}

function menuItemHTML(item) {
    const inCart = cart.find(i => i.id === item.id);
    return `
    <div class="menu-item" id="menu-item-${item.id}">
        <div class="menu-item-img" onclick="previewItem(${item.id})">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="menu-item-info">
            <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.2rem;">
                ${item.veg
                    ? '<span style="width:14px;height:14px;border:1.5px solid #27ae60;border-radius:2px;display:inline-flex;align-items:center;justify-content:center;"><span style="width:7px;height:7px;background:#27ae60;border-radius:50%;"></span></span>'
                    : '<span style="width:14px;height:14px;border:1.5px solid var(--red);border-radius:2px;display:inline-flex;align-items:center;justify-content:center;"><span style="width:7px;height:7px;background:var(--red);border-radius:50%;"></span></span>'}
                ${item.bestseller ? '<span style="background:rgba(226,55,68,0.1);color:var(--red);font-size:0.68rem;font-weight:800;padding:0.1rem 0.4rem;border-radius:3px;">BESTSELLER</span>' : ''}
            </div>
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-desc">${item.description}</div>
            <div class="menu-item-price">₹${item.price}</div>
        </div>
        <div class="menu-item-action" id="mia-${item.id}">
            ${inCart
                ? `<div class="qty-controls">
                    <button class="qty-btn" onclick="changeMenuQty(${item.id}, -1)">−</button>
                    <span class="qty-val">${inCart.quantity}</span>
                    <button class="qty-btn" onclick="changeMenuQty(${item.id}, 1)">+</button>
                  </div>`
                : `<button class="add-btn" onclick="addMenuItemToCart(${item.id})">ADD</button>`
            }
        </div>
    </div>`;
}

function addMenuItemToCart(itemId) {
    const item = state.menu.find(i => i.id === itemId);
    if (!item) return;
    addToCart({ ...item, restaurant_id: state.currentRestaurant?.id });
    // Update just the action area
    const el = document.getElementById(`mia-${itemId}`);
    if (el) {
        const inCart = cart.find(i => i.id === itemId);
        el.innerHTML = `<div class="qty-controls">
            <button class="qty-btn" onclick="changeMenuQty(${itemId}, -1)">−</button>
            <span class="qty-val">${inCart ? inCart.quantity : 1}</span>
            <button class="qty-btn" onclick="changeMenuQty(${itemId}, 1)">+</button>
        </div>`;
    }
}

function changeMenuQty(itemId, delta) {
    changeQty(itemId, delta);
    const el = document.getElementById(`mia-${itemId}`);
    if (!el) return;
    const inCart = cart.find(i => i.id === itemId);
    if (inCart) {
        el.innerHTML = `<div class="qty-controls">
            <button class="qty-btn" onclick="changeMenuQty(${itemId}, -1)">−</button>
            <span class="qty-val">${inCart.quantity}</span>
            <button class="qty-btn" onclick="changeMenuQty(${itemId}, 1)">+</button>
        </div>`;
    } else {
        el.innerHTML = `<button class="add-btn" onclick="addMenuItemToCart(${itemId})">ADD</button>`;
    }
}

function filterMenuItems(query) {
    const items = document.querySelectorAll('.menu-item');
    const q = query.toLowerCase();
    items.forEach(el => {
        const name = el.querySelector('.menu-item-name')?.textContent.toLowerCase() || '';
        const desc = el.querySelector('.menu-item-desc')?.textContent.toLowerCase() || '';
        el.style.display = (!q || name.includes(q) || desc.includes(q)) ? 'flex' : 'none';
    });
    // Hide empty groups
    document.querySelectorAll('.menu-group').forEach(g => {
        const visible = [...g.querySelectorAll('.menu-item')].some(el => el.style.display !== 'none');
        g.style.display = visible ? '' : 'none';
    });
}

function scrollToMenuGroup(cat) {
    const el = document.getElementById(`mg-${cat.replace(/\s+/g, '-')}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelectorAll('.menu-categories-sidebar li').forEach(li => li.classList.remove('active'));
    event?.target?.classList.add('active');
}

// ===== CART UI =====
function updateCartUI() {
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    const countEl = document.getElementById('cart-count');
    countEl.textContent = count;
    countEl.classList.toggle('visible', count > 0);

    const itemsEl = document.getElementById('cart-items');
    const footer = document.getElementById('cart-footer');

    if (cart.length === 0) {
        itemsEl.innerHTML = `<div class="cart-empty-state">
            <div style="font-size:3rem;margin-bottom:1rem;">🛒</div>
            <h4>Your bag is empty</h4>
            <p>Add items from a restaurant to get started.</p>
        </div>`;
        if (footer) footer.style.display = 'none';
        // Update cart button restaurant subtitle
        const cartRestName = document.getElementById('cart-restaurant-name');
        if (cartRestName) cartRestName.textContent = '—';
        return;
    }

    // restaurant name
    const cartRestName = document.getElementById('cart-restaurant-name');
    if (cartRestName && state.currentRestaurant) cartRestName.textContent = state.currentRestaurant.name;

    itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-img"><img src="${item.image}" alt="${item.name}" loading="lazy"></div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price} × ${item.quantity}</div>
            </div>
            <div class="cart-item-qty">
                <button class="cart-qty-btn" onclick="changeQty(${item.id}, -1); updateCartUI();">−</button>
                <span class="cart-qty-val">${item.quantity}</span>
                <button class="cart-qty-btn" onclick="changeQty(${item.id}, 1); updateCartUI();">+</button>
            </div>
        </div>
    `).join('');

    if (footer) footer.style.display = 'block';

    // Totals
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') discount = Math.min((subtotal * appliedCoupon.value) / 100, appliedCoupon.maxDiscount);
        else discount = Math.min(appliedCoupon.value, subtotal);
    }
    const deliveryFee = subtotal >= 299 ? 0 : 49;
    const total = subtotal - discount + deliveryFee;

    document.getElementById('cart-subtotal').textContent = `₹${subtotal}`;
    document.getElementById('cart-delivery-fee').textContent = deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`;
    document.getElementById('cart-total').textContent = `₹${total.toFixed(0)}`;

    const discountRow = document.getElementById('discount-total-row');
    if (discountRow) {
        discountRow.style.display = discount > 0 ? 'flex' : 'none';
        document.getElementById('cart-discount').textContent = `-₹${discount.toFixed(0)}`;
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
}

// ===== ORDERS RENDERING =====
function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    if (!container) return;
    if (!orders || orders.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <div class="empty-icon">🍽️</div>
            <h3>No orders yet</h3>
            <p>Browse our restaurants and place your first order!</p>
            <button class="btn-primary" onclick="showSection('restaurants')">Order Now</button>
        </div>`;
        return;
    }
    container.innerHTML = orders.map(order => {
        const ds = (order.delivery_status || order.status || 'pending').toLowerCase();
        const width = ds.includes('delivered') ? 100 : ds.includes('shipped') || ds === 'on the way' ? 75 : ds.includes('preparing') ? 50 : 25;
        const statusClass = ds.includes('delivered') ? 'status-delivered' : ds.includes('shipped') ? 'status-shipped' : ds.includes('preparing') ? 'status-preparing' : 'status-pending';
        const statusText = ds.includes('delivered') ? 'Delivered' : ds.includes('shipped') ? 'On the Way' : ds.includes('preparing') ? 'Preparing' : 'Confirmed';
        return `<div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-title">${order.restaurant_name || 'Your Order'}</div>
                    <div class="order-date"><i class="fas fa-calendar-alt" style="margin-right:0.3rem;"></i>${new Date(order.date).toLocaleString()}</div>
                </div>
                <div class="order-status-badge ${statusClass}">${statusText}</div>
            </div>
            <div class="order-meta">
                <span><i class="fas fa-rupee-sign"></i> ₹${Number(order.total_amount).toFixed(0)}</span>
                <span><i class="fas fa-credit-card"></i> ${order.pay_mode || 'Card'}</span>
                <span><i class="fas fa-receipt"></i> Order #${String(order.id).slice(-6)}</span>
            </div>
            <div class="order-track">
                <div class="track-bar-outer">
                    <div class="track-bar-fill" style="width:${width}%"></div>
                </div>
                <div class="track-steps-row">
                    <span class="track-step-label ${width >= 25 ? 'active' : ''}">✓ Confirmed</span>
                    <span class="track-step-label ${width >= 50 ? 'active' : ''}">🔥 Preparing</span>
                    <span class="track-step-label ${width >= 75 ? 'active' : ''}">🛵 On Way</span>
                    <span class="track-step-label ${width >= 100 ? 'active' : ''}">🏠 Delivered</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ===== FLOATING TRACKER =====
function updateFloatingTracker() {
    const ft = document.getElementById('floating-tracker');
    const orders = JSON.parse(localStorage.getItem('fr_orders') || '[]');
    const active = orders.find(o => o.delivery_status !== 'delivered');
    if (!active) { if (ft) ft.style.display = 'none'; return; }
    if (ft) ft.style.display = 'block';
    const ds = (active.delivery_status || 'preparing').toLowerCase();
    const steps = ['confirmed', 'preparing', 'shipped', 'delivered'];
    const stepIdx = ds.includes('delivered') ? 3 : ds.includes('shipped') ? 2 : ds.includes('preparing') ? 1 : 0;
    const etaMap = { 0: '35 min', 1: '25 min', 2: '10 min', 3: 'Arrived!' };
    document.getElementById('ft-eta').textContent = etaMap[stepIdx] || '—';
    document.getElementById('ft-order-name').textContent = active.restaurant_name || 'Your order';
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`fts-${i}`);
        if (!stepEl) continue;
        stepEl.className = 'ft-step';
        if (i - 1 < stepIdx) stepEl.classList.add('completed');
        else if (i - 1 === stepIdx) stepEl.classList.add('active');
    }
    for (let i = 1; i <= 3; i++) {
        const lineEl = document.getElementById(`ftl-${i}`);
        if (lineEl) lineEl.style.width = i <= stepIdx ? '100%' : '0%';
    }
}

function toggleFloatingTracker() {
    document.getElementById('floating-tracker')?.classList.toggle('ft-collapsed');
}

// ===== AUTH MODAL =====
function openAuthModal() {
    document.getElementById('auth-modal').classList.add('visible');
    document.getElementById('auth-overlay').classList.add('visible');
    document.body.style.overflow = 'hidden';
}
function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('visible');
    document.getElementById('auth-overlay').classList.remove('visible');
    document.body.style.overflow = '';
}
function switchAuthTab(tab) {
    document.getElementById('auth-tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('auth-tab-register').classList.toggle('active', tab === 'register');
    document.getElementById('auth-login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('auth-register-form').style.display = tab === 'register' ? 'block' : 'none';
}

// ===== SUCCESS MODAL =====
function showSuccessModal() {
    document.getElementById('success-modal').classList.add('visible');
    document.getElementById('success-overlay').classList.add('visible');
    document.body.style.overflow = 'hidden';
}
function closeSuccessModal() {
    document.getElementById('success-modal').classList.remove('visible');
    document.getElementById('success-overlay').classList.remove('visible');
    document.body.style.overflow = '';
    showSection('orders');
}

// ===== TOAST =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== FILTER / SORT =====
function filterByCategory(cat) {
    activeCategoryFilter = cat;
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    const target = document.getElementById(`cat-${cat.toLowerCase()}`);
    if (target) target.classList.add('active');
    showSection('restaurants');
    renderRestaurants();
}

function setSort(sort) {
    activeSort = sort;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.getElementById(`sort-${sort}`)?.classList.add('active');
    renderRestaurants();
}

function filterRestaurantsUI() {
    renderRestaurants();
}

// ===== SEARCH =====
function handleHeroSearch(val) {
    if (!val) return;
    activeCategoryFilter = 'all';
    showSection('restaurants');
    document.getElementById('rest-search').value = val;
    renderRestaurants();
}

document.addEventListener('DOMContentLoaded', () => {
    const navInput = document.getElementById('nav-search-input');
    if (navInput) {
        navInput.addEventListener('input', e => {
            const val = e.target.value.toLowerCase();
            const resultsEl = document.getElementById('search-results');
            if (!val) { resultsEl.style.display = 'none'; return; }
            const matches = state.restaurants.filter(r =>
                r.name.toLowerCase().includes(val) ||
                r.cuisine.toLowerCase().includes(val) ||
                r.location.toLowerCase().includes(val)
            ).slice(0, 6);
            if (!matches.length) { resultsEl.style.display = 'none'; return; }
            resultsEl.style.display = 'block';
            resultsEl.innerHTML = matches.map(r => `
                <div class="search-result-item" onclick="viewRestaurant(${r.id},'${r.name.replace(/'/g,"\\'")}','${r.rating}','${r.location.replace(/'/g,"\\'")}')">
                    <span class="sri-emoji">🍽️</span>
                    <div class="sri-info">
                        <div class="sri-name">${r.name}</div>
                        <div class="sri-sub">${r.cuisine} • ${r.location}</div>
                    </div>
                    <i class="fas fa-arrow-right" style="color:var(--text-3);font-size:0.75rem;"></i>
                </div>
            `).join('');
        });
        navInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                handleHeroSearch(navInput.value);
                document.getElementById('search-results').style.display = 'none';
            }
        });
    }
});
