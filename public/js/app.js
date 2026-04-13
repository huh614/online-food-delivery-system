/* =============================================
   APP.JS - Core Data, State & API Logic
   Frontend-only mode: always uses local data.
   ============================================= */

const API_BASE = null; // always use local fallback
let currentUser = JSON.parse(localStorage.getItem('fr_user')) || null;
let cart = [];
let activeSort = 'recommended';
let activeCategoryFilter = 'all';

const state = {
    restaurants: [],
    currentRestaurant: null,
    menu: [],
    orders: []
};

// ===== FULL RESTAURANT & MENU DATA =====
const RESTAURANTS = [
    { id: 1, name: "Burger Bliss", location: "Bandra West", cuisine: "Burgers, Fast Food", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80", rating: 4.7, deliveryTime: "20-30 min", deliveryCost: 49, minOrder: 199, category: "Burgers", offer: "40% OFF up to ₹80", veg: false },
    { id: 2, name: "Pizza Palace", location: "Juhu", cuisine: "Pizza, Italian", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80", rating: 4.5, deliveryTime: "25-35 min", deliveryCost: 0, minOrder: 299, category: "Pizza", offer: "Free Delivery", veg: false },
    { id: 3, name: "Green Leaf Kitchen", location: "Powai", cuisine: "Healthy, Salads", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80", rating: 4.8, deliveryTime: "15-25 min", deliveryCost: 29, minOrder: 149, category: "Healthy", offer: "30% OFF", veg: true },
    { id: 4, name: "Sushi House", location: "Andheri East", cuisine: "Japanese, Sushi", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80", rating: 4.6, deliveryTime: "30-40 min", deliveryCost: 0, minOrder: 499, category: "Sushi", offer: "20% OFF on first", veg: false },
    { id: 5, name: "Biryani House", location: "Dadar", cuisine: "Biryani, North Indian", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80", rating: 4.9, deliveryTime: "25-35 min", deliveryCost: 49, minOrder: 199, category: "Biryani", offer: "50% OFF first order", veg: false },
    { id: 6, name: "The Cake Studio", location: "Colaba", cuisine: "Desserts, Bakery", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80", rating: 4.7, deliveryTime: "20-30 min", deliveryCost: 39, minOrder: 299, category: "Desserts", offer: "Buy 1 Get 1", veg: true },
    { id: 7, name: "Dragon Wok", location: "Goregaon", cuisine: "Chinese, Pan-Asian", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80", rating: 4.4, deliveryTime: "25-35 min", deliveryCost: 59, minOrder: 249, category: "Chinese", offer: "Flat ₹75 OFF", veg: false },
    { id: 8, name: "Smoothie Squad", location: "Versova", cuisine: "Beverages, Juices", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80", rating: 4.6, deliveryTime: "10-20 min", deliveryCost: 19, minOrder: 99, category: "Beverages", offer: "Free Drink on ₹199+", veg: true },
    { id: 9, name: "Street Tacos Co.", location: "Churchgate", cuisine: "Mexican, Wraps", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80", rating: 4.3, deliveryTime: "20-30 min", deliveryCost: 39, minOrder: 199, category: "Burgers", offer: "Combo Deals", veg: false },
    { id: 10, name: "Royal Biryani", location: "Thane", cuisine: "Biryani, Mughlai", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80", rating: 4.8, deliveryTime: "30-45 min", deliveryCost: 0, minOrder: 299, category: "Biryani", offer: "20% OFF", veg: false },
    { id: 11, name: "Pasta Republic", location: "Lower Parel", cuisine: "Italian, Pasta", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80", rating: 4.5, deliveryTime: "25-30 min", deliveryCost: 49, minOrder: 349, category: "Pizza", offer: "Free Garlic Bread", veg: false },
    { id: 12, name: "Chaat Corner", location: "Vile Parle", cuisine: "Indian Street Food", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80", rating: 4.6, deliveryTime: "15-20 min", deliveryCost: 29, minOrder: 99, category: "Biryani", offer: "30% OFF", veg: true }
];

const MENU_ITEMS = {
    1: [
        { id: 101, name: "Classic Whopper", price: 299, description: "Flame-grilled beef patty, fresh tomatoes, lettuce, creamy mayo", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", category: "Burgers", veg: false, bestseller: true },
        { id: 102, name: "Chicken Crispy Burger", price: 249, description: "Crispy fried chicken with coleslaw and pickles", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80", category: "Burgers", veg: false, bestseller: true },
        { id: 103, name: "Veggie Delight", price: 199, description: "Grilled veggies, fresh lettuce, special sauce on toasted bun", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=80", category: "Burgers", veg: true, bestseller: false },
        { id: 104, name: "Loaded Fries", price: 149, description: "Crispy fries loaded with cheese sauce, jalapenos and BBQ drizzle", image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&q=80", category: "Sides", veg: true, bestseller: false },
        { id: 105, name: "Chocolate Milkshake", price: 179, description: "Thick creamy chocolate milkshake topped with whipped cream", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", category: "Beverages", veg: true, bestseller: false }
    ],
    2: [
        { id: 201, name: "Margherita Classic", price: 349, description: "San Marzano tomato base, fresh mozzarella, basil leaves", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80", category: "Pizza", veg: true, bestseller: true },
        { id: 202, name: "Pepperoni Supreme", price: 449, description: "Double pepperoni, mozzarella, red onions on our signature sauce", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80", category: "Pizza", veg: false, bestseller: true },
        { id: 203, name: "BBQ Chicken Pizza", price: 499, description: "Smoked BBQ chicken, red peppers, caramelized onions", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", category: "Pizza", veg: false, bestseller: false },
        { id: 204, name: "Garlic Breadsticks", price: 149, description: "Toasted garlic bread with herb butter and marinara dipping sauce", image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&q=80", category: "Sides", veg: true, bestseller: false },
        { id: 205, name: "Tiramisu", price: 249, description: "Classic Italian dessert with espresso soaked ladyfingers", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80", category: "Desserts", veg: true, bestseller: false }
    ],
    3: [
        { id: 301, name: "Quinoa Power Bowl", price: 329, description: "Quinoa, roasted chickpeas, avocado, feta, tahini dressing", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", category: "Salads & Bowls", veg: true, bestseller: true },
        { id: 302, name: "Grilled Chicken Salad", price: 299, description: "Seasoned grilled chicken, romaine, cherry tomatoes, balsamic", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80", category: "Salads & Bowls", veg: false, bestseller: false },
        { id: 303, name: "Avocado Toast Deluxe", price: 249, description: "Sourdough toast, whipped avocado, poached egg, chili flakes", image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=400&q=80", category: "Breakfast", veg: true, bestseller: true },
        { id: 304, name: "Green Smoothie Bowl", price: 219, description: "Blended spinach banana, granola, fresh fruits, honey", image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80", category: "Breakfast", veg: true, bestseller: false }
    ],
    4: [
        { id: 401, name: "Salmon Sashimi (8 pcs)", price: 649, description: "Fresh premium salmon, wasabi, pickled ginger", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&q=80", category: "Sashimi", veg: false, bestseller: true },
        { id: 402, name: "Dragon Roll", price: 549, description: "Shrimp tempura, cucumber, topped with avocado and eel sauce", image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80", category: "Rolls", veg: false, bestseller: true },
        { id: 403, name: "Veggie Maki (6 pcs)", price: 349, description: "Cucumber, avocado, carrot, pickled daikon in seaweed rice", image: "https://images.unsplash.com/photo-1617196034873-8ff0d2c0cb47?w=400&q=80", category: "Rolls", veg: true, bestseller: false },
        { id: 404, name: "Edamame", price: 199, description: "Steamed young soybeans, sea salt, chili", image: "https://images.unsplash.com/photo-1602491451072-da3f9e0a5a4c?w=400&q=80", category: "Starters", veg: true, bestseller: false }
    ],
    5: [
        { id: 501, name: "Hyderabadi Dum Biryani", price: 349, description: "Fragrant basmati rice with slow-cooked tender mutton, saffron", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80", category: "Biryani", veg: false, bestseller: true },
        { id: 502, name: "Chicken Biryani", price: 299, description: "Aromatic basmati with marinated chicken, crispy onions, raita", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80", category: "Biryani", veg: false, bestseller: true },
        { id: 503, name: "Veg Biryani", price: 249, description: "Mixed vegetables, paneer, whole spices, served with raita", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80", category: "Biryani", veg: true, bestseller: false },
        { id: 504, name: "Chicken Tikka Masala", price: 279, description: "Tandoori chicken in rich tomato-cream masala sauce", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80", category: "Curry", veg: false, bestseller: false }
    ],
    6: [
        { id: 601, name: "Black Forest Cake (slice)", price: 179, description: "Chocolate sponge, whipped cream, cherries, chocolate shavings", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80", category: "Cakes", veg: true, bestseller: true },
        { id: 602, name: "Cheesecake NY Style", price: 199, description: "New York style with graham cracker crust, blueberry compote", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80", category: "Cakes", veg: true, bestseller: true },
        { id: 603, name: "Brownie Overload", price: 149, description: "Dense fudgy chocolate brownie with chocolate chips & walnuts", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80", category: "Brownies", veg: true, bestseller: false },
        { id: 604, name: "Macaron Box (6 pcs)", price: 299, description: "Assorted French macarons: Vanilla, Rose, Pistachio, Chocolate", image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&q=80", category: "Pastries", veg: true, bestseller: false }
    ],
    7: [
        { id: 701, name: "Kung Pao Chicken", price: 299, description: "Spicy stir-fried chicken, peanuts, chilis, and Chinese peppers", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&q=80", category: "Mains", veg: false, bestseller: true },
        { id: 702, name: "Singapore Noodles", price: 259, description: "Thin rice noodles, shrimp, egg, curry powder", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80", category: "Noodles", veg: false, bestseller: true },
        { id: 703, name: "Dim Sum Basket (4 pcs)", price: 199, description: "Steamed pork & shrimp dumplings with chili oil", image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80", category: "Starters", veg: false, bestseller: false },
        { id: 704, name: "Veg Spring Rolls (4 pcs)", price: 149, description: "Crispy fried rolls with cabbage, carrot, glass noodles", image: "https://images.unsplash.com/photo-1607529137908-6b36b7f1cb5d?w=400&q=80", category: "Starters", veg: true, bestseller: false }
    ],
    8: [
        { id: 801, name: "Mango Tango Smoothie", price: 179, description: "Fresh Alphonso mango, yogurt, honey, chia seeds", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80", category: "Smoothies", veg: true, bestseller: true },
        { id: 802, name: "Cold Brew Coffee", price: 199, description: "18-hour cold brewed arabica, served over ice with cream", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80", category: "Coffee", veg: true, bestseller: true },
        { id: 803, name: "Acai Bowl", price: 249, description: "Acai blend, granola, fresh berries, honey, coconut flakes", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80", category: "Bowls", veg: true, bestseller: false }
    ],
    9: [
        { id: 901, name: "Street Tacos (3 pcs)", price: 299, description: "Corn tortillas, marinated chicken tinga, salsa, cilantro, lime", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80", category: "Tacos", veg: false, bestseller: true },
        { id: 902, name: "Burrito Bowl", price: 349, description: "Rice, beans, pico de gallo, guac, sour cream, jalapeños", image: "https://images.unsplash.com/photo-1584208124888-b7e02a3e5e62?w=400&q=80", category: "Bowls", veg: false, bestseller: false },
        { id: 903, name: "Veg Quesadilla", price: 249, description: "Grilled flour tortilla, cheddar, peppers, onions, chipotle sauce", image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400&q=80", category: "Tacos", veg: true, bestseller: false }
    ],
    10: [
        { id: 1001, name: "Mutton Dum Biryani", price: 399, description: "Slow-cooked tender mutton in fragrant long-grain basmati", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80", category: "Biryani", veg: false, bestseller: true },
        { id: 1002, name: "Chicken Tikka Biryani", price: 329, description: "Tikka-marinated chicken, caramelized onions, biryani masala", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80", category: "Biryani", veg: false, bestseller: true },
        { id: 1003, name: "Paneer Biryani", price: 279, description: "Cottage cheese cubes, whole spices, served with raita & pickle", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80", category: "Biryani", veg: true, bestseller: false }
    ],
    11: [
        { id: 1101, name: "Spaghetti Bolognese", price: 349, description: "Al dente spaghetti in slow-cooked beef and tomato ragù", image: "https://images.unsplash.com/photo-1567608286850-5e7e7d702e37?w=400&q=80", category: "Pasta", veg: false, bestseller: true },
        { id: 1102, name: "Penne Arrabbiata", price: 299, description: "Spicy tomato sauce, olives, capers, Parmesan", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80", category: "Pasta", veg: true, bestseller: true },
        { id: 1103, name: "Mushroom Risotto", price: 379, description: "Creamy arborio rice, wild mushrooms, truffle oil, Parmesan", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80", category: "Mains", veg: true, bestseller: false }
    ],
    12: [
        { id: 1201, name: "Pani Puri (12 pcs)", price: 79, description: "Crispy puris filled with spiced potato, tamarind water", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80", category: "Chaat", veg: true, bestseller: true },
        { id: 1202, name: "Ragda Pattice", price: 99, description: "Potato patties topped with white pea curry, chutneys, sev", image: "https://images.unsplash.com/photo-1606491048802-8342506d7916?w=400&q=80", category: "Chaat", veg: true, bestseller: true },
        { id: 1203, name: "Masala Chai (2 cups)", price: 49, description: "Traditional Indian spiced tea brewed with ginger and cardamom", image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400&q=80", category: "Beverages", veg: true, bestseller: false }
    ]
};

const COUPONS = {
    'RUSH50': { type: 'percent', value: 50, maxDiscount: 100 },
    'RUSH100': { type: 'flat', value: 100, minOrder: 499 },
    'BOGO2024': { type: 'percent', value: 30, maxDiscount: 150 },
    'WELCOME': { type: 'percent', value: 20, maxDiscount: 80 }
};

let appliedCoupon = null;

// ===== API FETCH WITH FALLBACK =====
async function apiFetch(endpoint, options = {}) {
    if (!API_BASE) return fallback(endpoint, options);
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        if (!res.ok) throw new Error('API error');
        return await res.json();
    } catch {
        return fallback(endpoint, options);
    }
}

function fallback(endpoint, options = {}) {
    if (endpoint === '/restaurants') return RESTAURANTS;
    if (endpoint.includes('/menu')) {
        const id = parseInt(endpoint.split('/')[2]);
        return MENU_ITEMS[id] || [];
    }
    if (endpoint === '/orders' && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        const rest = state.restaurants.find(r => r.id === body.restaurant_id) || {};
        const order = {
            id: Date.now(),
            user_id: body.user_id,
            restaurant_id: body.restaurant_id,
            restaurant_name: rest.name || 'Restaurant',
            restaurant_image: rest.image || '',
            total_amount: body.total_amount,
            status: 'pending',
            delivery_status: 'preparing',
            pay_status: 'completed',
            pay_mode: body.pay_mode || 'Card',
            date: new Date().toISOString(),
            items: body.items
        };
        const orders = JSON.parse(localStorage.getItem('fr_orders') || '[]');
        orders.unshift(order);
        localStorage.setItem('fr_orders', JSON.stringify(orders));
        scheduleDelivery(order.id);
        return { order_id: order.id, message: 'Order placed' };
    }
    if (endpoint.includes('/orders')) {
        return JSON.parse(localStorage.getItem('fr_orders') || '[]');
    }
    if (endpoint === '/login' && options?.method === 'POST') {
        const { email, password } = JSON.parse(options.body);
        const users = JSON.parse(localStorage.getItem('fr_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) return { user };
        throw new Error('Invalid credentials');
    }
    if (endpoint === '/register' && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        const users = JSON.parse(localStorage.getItem('fr_users') || '[]');
        if (users.find(u => u.email === body.email)) throw new Error('Email already exists');
        const newUser = { ...body, id: Date.now(), role: 'customer' };
        users.push(newUser);
        localStorage.setItem('fr_users', JSON.stringify(users));
        return { user: newUser };
    }
    return [];
}

// ===== DELIVERY SIMULATION =====
function scheduleDelivery(orderId) {
    const steps = [
        { delay: 8000,  status: 'preparing' },
        { delay: 18000, status: 'shipped' },
        { delay: 35000, status: 'delivered' }
    ];
    steps.forEach(({ delay, status }) => {
        setTimeout(() => {
            const orders = JSON.parse(localStorage.getItem('fr_orders') || '[]');
            const idx = orders.findIndex(o => o.id === orderId);
            if (idx !== -1) {
                orders[idx].delivery_status = status;
                if (status === 'delivered') orders[idx].status = 'delivered';
                localStorage.setItem('fr_orders', JSON.stringify(orders));
            }
            updateFloatingTracker();
            if (document.getElementById('orders').style.display !== 'none') fetchOrders();
        }, delay);
    });
}

// ===== LOAD FUNCTIONS =====
async function loadRestaurants() {
    const data = await apiFetch('/restaurants');
    state.restaurants = data;
    renderRestaurants();
    renderHomeRestaurants();
}

async function loadMenu(restaurantId) {
    const data = await apiFetch(`/restaurants/${restaurantId}/menu`);
    // Attach restaurant_id just in case
    state.menu = data.map(i => ({ ...i, restaurant_id: restaurantId }));
    renderMenu();
}

async function fetchOrders() {
    if (!currentUser) {
        renderOrders([]);
        return;
    }
    const orders = await apiFetch(`/users/${currentUser.id}/orders`);
    // fallback uses localStorage
    const localOrders = JSON.parse(localStorage.getItem('fr_orders') || '[]');
    state.orders = localOrders.length ? localOrders : (Array.isArray(orders) ? orders : []);
    renderOrders(state.orders);
}

// ===== AUTH =====
async function handleAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!email || !password) return showToast('Please fill in all fields', 'error');
    try {
        const res = await apiFetch('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        if (res && res.user) {
            currentUser = res.user;
        } else {
            currentUser = { id: Date.now(), username: email.split('@')[0], email, role: 'customer' };
        }
        localStorage.setItem('fr_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeAuthModal();
        showToast(`Welcome back, ${currentUser.username || currentUser.email.split('@')[0]}! 👋`, 'success');
    } catch (err) {
        // Lenient fallback login
        currentUser = { id: Date.now(), username: email.split('@')[0], email, role: 'customer' };
        localStorage.setItem('fr_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeAuthModal();
        showToast(`Welcome, ${currentUser.username}! 👋`, 'success');
    }
}

async function handleRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const phone = document.getElementById('reg-phone').value.trim();
    if (!name || !email || !password) return showToast('Please fill in all required fields', 'error');
    try {
        const res = await apiFetch('/register', { method: 'POST', body: JSON.stringify({ username: name, email, password, phone }) });
        currentUser = res.user || { id: Date.now(), username: name, email, role: 'customer' };
        localStorage.setItem('fr_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeAuthModal();
        showToast(`🎉 Account created! Welcome, ${name}!`, 'success');
    } catch (err) {
        showToast(err.message || 'Registration failed', 'error');
    }
}

function updateAuthUI() {
    const btn = document.getElementById('auth-btn');
    const btnText = document.getElementById('auth-btn-text');
    if (currentUser) {
        const initial = (currentUser.username || currentUser.email || 'U')[0].toUpperCase();
        btn.innerHTML = `<span style="width:28px;height:28px;background:rgba(255,255,255,0.25);border-radius:50%;display:grid;place-items:center;font-size:0.85rem;font-weight:700;">${initial}</span> ${currentUser.username || currentUser.email.split('@')[0]}`;
        btn.onclick = () => {
            if (confirm(`Logout from FoodRush?`)) {
                localStorage.removeItem('fr_user');
                currentUser = null;
                updateAuthUI();
                showToast('Logged out successfully', 'info');
            }
        };
    } else {
        btn.innerHTML = '<i class="fas fa-user"></i><span id="auth-btn-text">Login</span>';
        btn.onclick = openAuthModal;
    }
}

// ===== CART =====
function addToCart(item) {
    if (cart.length > 0) {
        const firstRestId = cart[0].restaurant_id;
        if (firstRestId && item.restaurant_id && firstRestId !== item.restaurant_id) {
            if (!confirm('You have items from another restaurant. Starting a new order will clear your current bag. Continue?')) return;
            cart = [];
        }
    }
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    updateCartUI();
    showToast(`Added ${item.name} to bag 🛍️`, 'success');
    // Animate cart button
    const countEl = document.getElementById('cart-count');
    countEl.classList.remove('pop');
    void countEl.offsetWidth;
    countEl.classList.add('pop');
}

function changeQty(itemId, delta) {
    const idx = cart.findIndex(i => i.id === itemId);
    if (idx === -1) return;
    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    updateCartUI();
}

function applyCoupon() {
    const code = document.getElementById('coupon-input').value.trim().toUpperCase();
    const msgEl = document.getElementById('coupon-msg');
    if (!COUPONS[code]) {
        msgEl.textContent = '❌ Invalid coupon code.';
        msgEl.className = 'coupon-msg error';
        appliedCoupon = null;
        updateCartUI();
        return;
    }
    const coupon = COUPONS[code];
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    if (coupon.minOrder && subtotal < coupon.minOrder) {
        msgEl.textContent = `❌ Minimum order ₹${coupon.minOrder} required.`;
        msgEl.className = 'coupon-msg error';
        appliedCoupon = null;
        updateCartUI();
        return;
    }
    appliedCoupon = { ...coupon, code };
    msgEl.textContent = `✅ Coupon ${code} applied!`;
    msgEl.className = 'coupon-msg success';
    updateCartUI();
    showToast(`Coupon ${code} applied! 🎉`, 'success');
}

async function checkout() {
    if (!currentUser) {
        openAuthModal();
        showToast('Please login to place an order', 'error');
        return;
    }
    if (cart.length === 0) { showToast('Your bag is empty!', 'error'); return; }
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') discount = Math.min((subtotal * appliedCoupon.value) / 100, appliedCoupon.maxDiscount);
        else discount = appliedCoupon.value;
    }
    const deliveryFee = subtotal >= 299 ? 0 : 49;
    const total = subtotal - discount + deliveryFee;
    const payMode = document.getElementById('payment-mode')?.value || 'Credit Card';
    const restaurantId = cart[0].restaurant_id;

    await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ user_id: currentUser.id, restaurant_id: restaurantId, total_amount: total, pay_mode: payMode, items: cart })
    });

    cart = [];
    appliedCoupon = null;
    document.getElementById('coupon-input').value = '';
    document.getElementById('coupon-msg').textContent = '';
    updateCartUI();
    toggleCart();
    showSuccessModal();
    updateFloatingTracker();
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
    loadRestaurants();
    updateAuthUI();
    updateCartUI();
    animateCounters();
    updateFloatingTracker();

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
    });

    // Close search on outside click
    document.addEventListener('click', e => {
        if (!e.target.closest('.nav-search')) {
            document.getElementById('search-results').style.display = 'none';
        }
    });
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 1500;
                const step = target / (duration / 16);
                let current = 0;
                const interval = setInterval(() => {
                    current = Math.min(current + step, target);
                    el.textContent = target >= 1000 ? (current >= 1000 ? Math.floor(current / 1000) + 'k+' : Math.floor(current)) : Math.floor(current) + (el.dataset.count === '30' ? ' min' : '+');
                    if (current >= target) clearInterval(interval);
                }, 16);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}
