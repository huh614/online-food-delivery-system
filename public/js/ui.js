// --- UI Rendering ---

function showSection(sectionId) {
    const sections = ['home', 'restaurants', 'menu', 'orders'];
    sections.forEach(s => {
        document.getElementById(s).style.display = (s === sectionId) ? 'block' : 'none';
    });
    window.scrollTo(0, 0);
}

function renderRestaurants() {
    const grid = document.getElementById('restaurant-grid');
    grid.innerHTML = state.restaurants.map(rest => `
        <div class="card glass animate-in" onclick="viewRestaurant(${rest.id}, '${rest.name}')">
            <img src="${rest.image}" class="card-img" alt="${rest.name}">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <h3>${rest.name}</h3>
                    <span style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 0.5rem; font-size: 0.8rem;">
                        <i class="fas fa-star" style="color: gold;"></i> ${rest.rating}
                    </span>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">${rest.location}</p>
            </div>
        </div>
    `).join('');
}

function viewRestaurant(id, name) {
    document.getElementById('restaurant-name-title').innerText = name;
    showSection('menu');
    loadMenu(id);
}

function renderMenu() {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = state.menu.map(item => `
        <div class="card glass animate-in">
            <img src="${item.image}" class="card-img" alt="${item.name}">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between;">
                    <h3>${item.name}</h3>
                    <h3 style="color: var(--primary);">$${item.price}</h3>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0.5rem 0;">${item.description}</p>
                <button class="btn-primary" style="width: 100%; margin-top: 1rem;" onclick="addToCart({id: ${item.id}, name: '${item.name}', price: ${item.price}, image: '${item.image}'})">
                    Add to Bag
                </button>
            </div>
        </div>
    `).join('');
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = count;

    const itemsList = document.getElementById('cart-items');
    itemsList.innerHTML = cart.map((item, index) => `
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem;">
            <img src="${item.image}" style="width: 60px; height: 60px; border-radius: 0.5rem; object-fit: cover;">
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between;">
                    <h4 style="font-weight: 600;">${item.name}</h4>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                    <div class="glass" style="display: flex; align-items: center; border-radius: 0.5rem; overflow: hidden;">
                        <button onclick="changeQty(${index}, -1)" style="background: none; border: none; color: white; padding: 0.2rem 0.5rem;">-</button>
                        <span style="padding: 0 0.5rem;">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" style="background: none; border: none; color: white; padding: 0.2rem 0.5rem;">+</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
}

function changeQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    updateCartUI();
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function toggleAuth() {
    const modal = document.getElementById('auth-modal');
    modal.style.display = (modal.style.display === 'none') ? 'block' : 'none';
}

function updateAuthUI() {
    const link = document.getElementById('auth-link');
    if (currentUser) {
        link.innerText = `Hi, ${currentUser.username}`;
        link.onclick = () => {
             if(confirm('Logout?')) {
                 localStorage.removeItem('user');
                 currentUser = null;
                 updateAuthUI();
             }
        };
        fetchOrders(); // Load orders if logged in
    } else {
        link.innerText = 'Login';
        link.onclick = toggleAuth;
    }
}

async function fetchOrders() {
    if (!currentUser) return;
    const orders = await apiFetch(`/users/${currentUser.id || 1}/orders`);
    renderOrders(orders);
}

function renderOrders(orders) {
    const list = document.getElementById('orders-list');
    if (!orders || orders.length === 0) {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No orders yet.</p>';
        return;
    }
    list.innerHTML = orders.map(order => `
        <div class="card glass animate-in" style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <h3>Order #${order.id}</h3>
                <span class="glass" style="padding: 0.3rem 0.8rem; border-radius: 1rem; color: var(--primary); font-weight: 600;">
                    ${order.status.toUpperCase()}
                </span>
            </div>
            <p><strong>Restaurant:</strong> ${order.restaurant_name || 'N/A'}</p>
            <p><strong>Total:</strong> $${order.total_amount.toFixed(2)}</p>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 1rem;">Placed on: ${new Date(order.date).toLocaleDateString()}</p>
            
            <div style="margin-top: 1.5rem;">
                <div style="height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; position: relative; overflow: hidden;">
                    <div style="position: absolute; left: 0; top: 0; height: 100%; width: ${getStatusWidth(order.status)}%; background: var(--primary-gradient);"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-top: 0.5rem; color: var(--text-muted);">
                    <span>Placed</span>
                    <span>Preparing</span>
                    <span>Out for Delivery</span>
                    <span>Delivered</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusWidth(status) {
    switch(status) {
        case 'pending': return 25;
        case 'preparing': return 50;
        case 'shipped': return 75;
        case 'delivered': return 100;
        default: return 25;
    }
}
