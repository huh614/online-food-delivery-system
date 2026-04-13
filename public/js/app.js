const API_BASE = 'http://localhost:3000/api';
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let cart = [];

// --- State Management ---
const state = {
    restaurants: [],
    currentRestaurant: null,
    menu: [],
    orders: []
};

// --- Hybrid API Helper ---
async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        if (!response.ok) throw new Error('API Error');
        return await response.json();
    } catch (err) {
        console.warn(`Backend not available, using LocalStorage for ${endpoint}`);
        return fallbackLogic(endpoint, options);
    }
}

// Fallback logic for GitHub Pages / Static hosting
function fallbackLogic(endpoint, options) {
    if (endpoint === '/restaurants') {
        return [
            { id: 1, name: 'Burger King', location: 'Downtown', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500', rating: 4.7 },
            { id: 2, name: 'Pizza Hut', location: 'Uptown', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', rating: 4.5 },
            { id: 3, name: 'Healthy Eats', location: 'Midtown', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', rating: 4.8 }
        ];
    }
    if (endpoint.includes('/menu')) {
        return [
            { id: 1, restaurant_id: 1, name: 'Whopper Meal', price: 12.99, description: 'Flame-grilled beef burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
            { id: 2, restaurant_id: 1, name: 'Chicken Royale', price: 10.99, description: 'Crispy chicken with lettuce', image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?w=500' },
            { id: 3, restaurant_id: 2, name: 'Margherita Pizza', price: 15.99, description: 'Classic tomato and mozzarella', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500' },
            { id: 4, restaurant_id: 2, name: 'Pepperoni Feast', price: 18.99, description: 'Double pepperoni with extra cheese', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500' },
            { id: 5, restaurant_id: 3, name: 'Avocado Toast', price: 9.99, description: 'Sourdough with smashed avocado', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=500' }
        ].filter(item => endpoint.includes(`/restaurants/${item.restaurant_id}/`));
    }
    if (endpoint === '/orders' && options.method === 'POST') {
        const body = JSON.parse(options.body);
        const newOrder = {
            id: Date.now(),
            user_id: body.user_id,
            restaurant_id: body.restaurant_id,
            restaurant_name: state.restaurants.find(r => r.id === body.restaurant_id)?.name || 'Restaurant',
            total_amount: body.total_amount,
            status: 'pending',
            delivery_status: 'preparing',
            pay_status: 'completed',
            pay_mode: body.pay_mode || 'Card',
            date: new Date().toISOString(),
            items: body.items
        };
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Simulate delivery tracking updating in background
        simulateDelivery(newOrder.id);
        
        return { order_id: newOrder.id, message: 'Order placed successfully' };
    }
    if (endpoint.includes('/orders')) {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }
    
    // Auth fallbacks
    return [];
}

function simulateDelivery(orderId) {
    setTimeout(() => updateOrderStatus(orderId, 'shipped'), 10000); // 10 seconds
    setTimeout(() => updateOrderStatus(orderId, 'delivered'), 25000); // 25 seconds
}

function updateOrderStatus(orderId, status) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.delivery_status = status;
        localStorage.setItem('orders', JSON.stringify(orders));
        if (document.getElementById('orders').style.display === 'block') {
            fetchOrders(); // refresh view
        }
    }
}

// --- Features ---
async function loadRestaurants() {
    const data = await apiFetch('/restaurants');
    state.restaurants = data;
    renderRestaurants();
}

async function loadMenu(restaurantId) {
    const data = await apiFetch(`/restaurants/${restaurantId}/menu`);
    state.menu = data;
    renderMenu();
}

async function handleAuth() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    // Simple mock or API
    const user = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    if (user && user.user) {
        currentUser = user.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateAuthUI();
        toggleAuth();
    } else {
        // Fallback login
        if (email && password) {
            currentUser = { username: email.split('@')[0], email };
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateAuthUI();
            toggleAuth();
        }
    }
}

function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    updateCartUI();
}

async function checkout() {
    if (!currentUser) {
        toggleAuth(); // Force login
        return alert('Please login to place an order.');
    }
    if (cart.length === 0) return alert('Cart is empty');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const payMode = document.getElementById('payment-mode') ? document.getElementById('payment-mode').value : 'Card';
    
    // Assume all items in cart are from the same restaurant for simplicity
    const restaurantId = state.menu.find(m => m.id === cart[0].id)?.restaurant_id || 1;

    const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
            user_id: currentUser.id || currentUser.email,
            restaurant_id: restaurantId,
            total_amount: total,
            pay_mode: payMode,
            items: cart
        })
    });

    // Reset visual cart & show success modal
    cart = [];
    updateCartUI();
    toggleCart();
    
    document.getElementById('checkout-success-modal').style.display = 'block';
    setTimeout(() => {
        document.getElementById('checkout-success-modal').style.display = 'none';
        showSection('orders');
    }, 3000);
}

// Init
window.onload = () => {
    loadRestaurants();
    updateAuthUI();
    updateCartUI();
};
