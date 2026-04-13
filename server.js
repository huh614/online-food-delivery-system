const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { db, initDB } = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize Database
initDB().then(() => {
    console.log('Database initialized successfully.');
}).catch(err => {
    console.error('Database initialization failed:', err);
});

// --- API Routes ---

// Auth - Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        res.json({ message: 'Login successful', user });
    });
});

// Auth - Register
app.post('/api/register', (req, res) => {
    const { username, email, password, address, phone } = req.body;
    db.run(`INSERT INTO users (username, email, password, address, phone) VALUES (?, ?, ?, ?, ?)`, 
    [username, email, password, address, phone], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID, message: 'User registered' });
    });
});

// Restaurants - List all
app.get('/api/restaurants', (req, res) => {
    db.all("SELECT * FROM restaurants", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Menu - List items for a restaurant
app.get('/api/restaurants/:id/menu', (req, res) => {
    db.all("SELECT * FROM menu WHERE restaurant_id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Orders - Create new order
app.post('/api/orders', (req, res) => {
    const { user_id, restaurant_id, total_amount, items } = req.body;
    db.serialize(() => {
        db.run(`INSERT INTO orders (user_id, restaurant_id, total_amount) VALUES (?, ?, ?)`, 
        [user_id, restaurant_id, total_amount], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const order_id = this.lastID;
            const stmt = db.prepare(`INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)`);
            items.forEach(item => {
                stmt.run(order_id, item.id, item.quantity, item.price);
            });
            stmt.finalize();

            res.json({ order_id, message: 'Order placed successfully' });
        });
    });
});

// Orders - Get user orders
app.get('/api/users/:id/orders', (req, res) => {
    db.all(`SELECT o.*, r.name as restaurant_name FROM orders o 
            JOIN restaurants r ON o.restaurant_id = r.id 
            WHERE o.user_id = ? ORDER BY o.date DESC`, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
