const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'delivery_system.db');
const db = new sqlite3.Database(dbPath);

const initDB = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'customer',
                address TEXT,
                phone TEXT
            )`);

            // Restaurants Table
            db.run(`CREATE TABLE IF NOT EXISTS restaurants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                location TEXT,
                contact TEXT,
                image TEXT,
                rating REAL DEFAULT 4.5
            )`);

            // Menu Table
            db.run(`CREATE TABLE IF NOT EXISTS menu (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                restaurant_id INTEGER,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT,
                image TEXT,
                category TEXT,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
            )`);

            // Orders Table
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                restaurant_id INTEGER,
                total_amount REAL,
                status TEXT DEFAULT 'pending',
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
            )`);

            // Order Items Table
            db.run(`CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                menu_id INTEGER,
                quantity INTEGER,
                price REAL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (menu_id) REFERENCES menu(id)
            )`);

            // Delivery Table
            db.run(`CREATE TABLE IF NOT EXISTS delivery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                status TEXT DEFAULT 'pending',
                deli_time DATETIME,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )`);

            // Payment Table
            db.run(`CREATE TABLE IF NOT EXISTS payment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                pay_mode TEXT,
                pay_status TEXT DEFAULT 'pending',
                pay_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )`);

            // Seed initial data if empty
            db.get("SELECT COUNT(*) as count FROM restaurants", (err, row) => {
                if (row.count === 0) {
                    console.log("Seeding initial data...");
                    seedData();
                }
            });

            resolve();
        });
    });
};

const seedData = () => {
    const restaurants = [
        ['Burger King', 'Downtown', '123-456-7890', 'burger_king.jpg', 4.7],
        ['Pizza Hut', 'Uptown', '098-765-4321', 'pizza_hut.jpg', 4.5],
        ['Healthy Eats', 'Midtown', '555-0199', 'healthy_eats.jpg', 4.8]
    ];

    const menuItems = [
        [1, 'Whopper Meal', 12.99, 'Flame-grilled beef burger with fries and drink', 'whopper.jpg', 'Burgers'],
        [1, 'Chicken Royale', 10.99, 'Crispy chicken with lettuce and mayo', 'chicken_royale.jpg', 'Burgers'],
        [2, 'Margherita Pizza', 15.99, 'Classic tomato and mozzarella', 'margherita.jpg', 'Pizza'],
        [2, 'Pepperoni Feast', 18.99, 'Double pepperoni with extra cheese', 'pepperoni.jpg', 'Pizza'],
        [3, 'Quinoa Salad', 14.50, 'Fresh quinoa with roasted veggies', 'quinoa_salad.jpg', 'Salads'],
        [3, 'Avocado Toast', 9.99, 'Sourdough with smashed avocado and egg', 'avocado_toast.jpg', 'Breakfast']
    ];

    restaurants.forEach(r => {
        db.run(`INSERT INTO restaurants (name, location, contact, image, rating) VALUES (?, ?, ?, ?, ?)`, r);
    });

    menuItems.forEach(m => {
        db.run(`INSERT INTO menu (restaurant_id, name, price, description, image, category) VALUES (?, ?, ?, ?, ?, ?)`, m);
    });

    // Default User (Admin)
    db.run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES ('admin', 'admin@foodlite.com', 'admin123', 'admin')`);
};

module.exports = { db, initDB };
