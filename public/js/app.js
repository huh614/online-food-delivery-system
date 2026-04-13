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
            { id: 1, name: 'Whopper Meal', price: 12.99, description: 'Flame-grilled beef burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
            { id: 2, name: 'Chicken Royale', price: 10.99, description: 'Crispy chicken with lettuce', image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?w=500' }
        ];
    }
    // Auth & Orders fallbacks can use localStorage
    return [];
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
    if (!currentUser) return alert('Please login first');
    if (cart.length === 0) return alert('Cart is empty');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
            user_id: currentUser.id || 1,
            restaurant_id: state.menu[0].restaurant_id || 1,
            total_amount: total,
            items: cart
        })
    });

    alert('Order placed successfully!');
    cart = [];
    updateCartUI();
    toggleCart();
    showSection('orders');
}

// Init
window.onload = () => {
    loadRestaurants();
    updateAuthUI();
    updateCartUI();
};
