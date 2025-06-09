const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(express.json());
app.use(cors());  // ✅ Apenas uma chamada do CORS

// Criar tabelas se não existirem
db.run(`
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
)`);

db.run(`
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_cost REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
)`);

// Rota para listar todos os produtos
app.get('/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Rota para adicionar um novo produto
app.post("/products", (req, res) => {
    const { name, code, price, stock } = req.body;
    db.run('INSERT INTO products (name, code, price, stock) VALUES (?, ?, ?, ?)',
        [name, code, price, stock], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: "Produto adicionado com sucesso!" });
        });
});

// Rota para registrar uma compra
app.post('/purchase', (req, res) => {
    const { code, quantity } = req.body;

    db.get('SELECT id, price, stock FROM products WHERE code = ?', [code], (err, product) => {
        if (err || !product) {
            res.status(400).json({ error: "Produto não encontrado!" });
            return;
        }

        if (product.stock < quantity) {
            res.status(400).json({ error: "Estoque insuficiente!" });
            return;
        }

        const totalCost = product.price * quantity;
        db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, product.id]);
        db.run('INSERT INTO purchases (product_id, quantity, total_cost) VALUES (?, ?, ?)',
            [product.id, quantity, totalCost], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: `Compra registrada! Total: R$ ${totalCost.toFixed(2)}` });
            });
    });
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
