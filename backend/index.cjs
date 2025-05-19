const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'sua_chave_secreta_aqui'; // Troque por uma chave forte em produção

const pool = new Pool({
  connectionString: 'postgresql://FinancEasyWeb_owner:npg_su5NWb1AGnZr@ep-tiny-pine-a4tdvgyi-pooler.us-east-1.aws.neon.tech/FinancEasyWeb?sslmode=require'
});

// Criação das tabelas principais
async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      display_name VARCHAR(255)
    );
    CREATE TABLE IF NOT EXISTS credit_cards (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      name VARCHAR(100),
      number VARCHAR(30),
      card_limit NUMERIC,
      available_limit NUMERIC,
      due_date INTEGER,
      closing_date INTEGER,
      color VARCHAR(30),
      bank VARCHAR(50)
    );
    CREATE TABLE IF NOT EXISTS incomes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      description VARCHAR(255),
      amount NUMERIC,
      date DATE,
      category VARCHAR(100),
      source VARCHAR(100)
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      description VARCHAR(255),
      amount NUMERIC,
      date DATE,
      category VARCHAR(100),
      payment_method VARCHAR(100)
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      card_id INTEGER REFERENCES credit_cards(id),
      month VARCHAR(20),
      year INTEGER,
      amount NUMERIC,
      status VARCHAR(20),
      due_date DATE
    );
  `);
}
createTables();

// Middleware para autenticação JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

// Cadastro
app.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  try {
    const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name',
      [email, hash, displayName || null]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar.' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT id, email, password, display_name FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    delete user.password;
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// Exemplo de rota protegida: buscar cartões do usuário
app.get('/credit-cards', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM credit_cards WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar cartões.' });
  }
});

// Rotas de Cartões de Crédito
app.get('/credit-cards', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM credit_cards WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar cartões.' });
  }
});

app.post('/credit-cards', authMiddleware, async (req, res) => {
  const { name, number, card_limit, available_limit, due_date, closing_date, color, bank } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO credit_cards 
        (user_id, name, number, card_limit, available_limit, due_date, closing_date, color, bank)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, name, number, card_limit, available_limit, due_date, closing_date, color, bank]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar cartão.' });
  }
});

// Rotas de Receitas
app.get('/incomes', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM incomes WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar receitas.' });
  }
});

app.post('/incomes', authMiddleware, async (req, res) => {
  const { description, amount, date, category, source } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO incomes (user_id, description, amount, date, category, source)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, description, amount, date, category, source]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar receita.' });
  }
});

// Rotas de Despesas
app.get('/expenses', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar despesas.' });
  }
});

app.post('/expenses', authMiddleware, async (req, res) => {
  const { description, amount, date, category, payment_method } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO expenses (user_id, description, amount, date, category, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, description, amount, date, category, payment_method]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar despesa.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
