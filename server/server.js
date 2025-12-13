const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_fallback_do_not_use_in_prod';

app.use(cors());
app.use(express.json());

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
        );
        const user = result.rows[0];

        // Create Default Categories for new user
        const defaultCategories = [
            ['Alimentation', 0, 'bg-emerald-500', 'shopping-bag'],
            ['Logement', 0, 'bg-blue-500', 'home'],
            ['Transport', 0, 'bg-indigo-500', 'car'],
            ['Loisirs', 0, 'bg-purple-500', 'coffee'],
            ['Santé', 0, 'bg-rose-500', 'activity'],
            ['Shopping', 0, 'bg-pink-500', 'gift'],
            ['Factures', 0, 'bg-orange-500', 'zap'],
            ['Revenus', 0, 'bg-green-500', 'wallet'],
            ['Épargne', 0, 'bg-cyan-500', 'piggy-bank']
        ];

        for (const cat of defaultCategories) {
            await db.query(
                'INSERT INTO categories (user_id, name, budget, color, icon, is_default) VALUES ($1, $2, $3, $4, $5, TRUE)',
                [user.id, ...cat]
            );
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) return res.status(400).json({ error: "Utilisateur non trouvé" });

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: "Mot de passe incorrect" });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Me (Check Session)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    res.json({ user: req.user });
});


// --- PROTECTED DATA ROUTES ---

// Init (Dashboard)
app.get('/api/init', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await db.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]);
        const categories = await db.query('SELECT * FROM categories WHERE user_id = $1', [userId]);
        const goals = await db.query('SELECT * FROM goals WHERE user_id = $1', [userId]);
        const subscriptions = await db.query('SELECT * FROM subscriptions WHERE user_id = $1', [userId]);

        res.json({
            transactions: transactions.rows,
            categories: categories.rows,
            goals: goals.rows,
            subscriptions: subscriptions.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Transactions CRUD
app.post('/api/transactions', authenticateToken, async (req, res) => {
    const { title, amount, type, category, date, is_recurring } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO transactions (user_id, title, amount, type, category, date, is_recurring) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [req.user.id, title, amount, type, category, date, is_recurring]
        );
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, amount, type, category, date, is_recurring } = req.body;
    try {
        const result = await db.query(
            'UPDATE transactions SET title=$1, amount=$2, type=$3, category=$4, date=$5, is_recurring=$6 WHERE id=$7 AND user_id=$8 RETURNING *',
            [title, amount, type, category, date, is_recurring, id, req.user.id]
        );
        if (result.rowCount === 0) return res.status(404).send("Not found");
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (result.rowCount === 0) return res.status(404).send("Not found");
        res.sendStatus(204);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

// Goals CRUD
app.post('/api/goals', authenticateToken, async (req, res) => {
    const { name, target_amount, current_amount, color, icon, deadline } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO goals (user_id, name, target_amount, current_amount, color, icon, deadline) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [req.user.id, name, target_amount, current_amount, color, icon, deadline]
        );
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, target_amount, current_amount, color, icon, deadline } = req.body;
    try {
        const result = await db.query(
            'UPDATE goals SET name=$1, target_amount=$2, current_amount=$3, color=$4, icon=$5, deadline=$6 WHERE id=$7 AND user_id=$8 RETURNING *',
            [name, target_amount, current_amount, color, icon, deadline, id, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM goals WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        res.sendStatus(204);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

// Subscriptions CRUD
app.post('/api/subscriptions', authenticateToken, async (req, res) => {
    const { title, amount, category, renewal_date, icon } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO subscriptions (user_id, title, amount, category, renewal_date, icon) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, title, amount, category, renewal_date, icon]
        );
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

app.delete('/api/subscriptions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM subscriptions WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        res.sendStatus(204);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

// Categories CRUD
app.post('/api/categories', authenticateToken, async (req, res) => {
    const { name, budget, color, icon } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO categories (user_id, name, budget, color, icon) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, name, budget, color, icon]
        );
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, budget, color, icon } = req.body;
    try {
        const result = await db.query(
            'UPDATE categories SET name=$1, budget=$2, color=$3, icon=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
            [name, budget, color, icon, id, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        res.sendStatus(204);
    } catch (err) { console.error(err); res.status(500).send("Error"); }
});

// Export app for Vercel
module.exports = app;

// Only listen if not running in Vercel (local node server.js)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
