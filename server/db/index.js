import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create a new pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://financeasy_owner:npg_qre6KP8bJnVg@ep-solitary-wind-acspapl1-pooler.sa-east-1.aws.neon.tech/financeasy?sslmode=require&channel_binding=require',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Database initialization
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cartoes (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
        nome VARCHAR(100) NOT NULL,
        numero VARCHAR(4) NOT NULL,
        limite DECIMAL(10, 2) NOT NULL,
        data_fechamento INTEGER NOT NULL,
        data_vencimento INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS faturas (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
        cartaoId INTEGER REFERENCES cartoes(id) ON DELETE CASCADE,
        mes_referencia INTEGER NOT NULL,
        ano_referencia INTEGER NOT NULL,
        valor_total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS despesas (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        data DATE NOT NULL,
        tipo VARCHAR(20) NOT NULL,
        cartaoId INTEGER REFERENCES cartoes(id) ON DELETE SET NULL,
        faturaId INTEGER REFERENCES faturas(id) ON DELETE SET NULL,
        categoria VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pendente',
        data_vencimento DATE,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS receitas (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        data DATE NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pendente',
        data_vencimento DATE,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS investimentos (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tipo VARCHAR(50) NOT NULL,
        nome VARCHAR(100) NOT NULL,
        valor_aplicado DECIMAL(10, 2) NOT NULL,
        rendimento_mensal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        notificacoes_email BOOLEAN DEFAULT FALSE,
        tema VARCHAR(20) DEFAULT 'claro',
        alerta_limite_cartao INTEGER DEFAULT 80,
        alerta_vencimento_dias INTEGER DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de metas de gastos
    await client.query(`
      CREATE TABLE IF NOT EXISTS metas_gastos (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
        categoria VARCHAR(50) NOT NULL,
        valor_limite DECIMAL(10, 2) NOT NULL,
        descricao TEXT,
        data_inicio DATE,
        data_fim DATE,
        cor VARCHAR(7) DEFAULT '#147361',
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, categoria, mes, ano)
      );
    `);

    // Tabela de aportes para metas
    await client.query(`
      CREATE TABLE IF NOT EXISTS aportes_metas (
        id SERIAL PRIMARY KEY,
        meta_id INTEGER REFERENCES metas_gastos(id) ON DELETE CASCADE,
        valor DECIMAL(10, 2) NOT NULL,
        descricao TEXT,
        data DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de notificações
    await client.query(`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tipo VARCHAR(50) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        mensagem TEXT NOT NULL,
        lida BOOLEAN DEFAULT FALSE,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', e);
  } finally {
    client.release();
  }
};

// DB query helper function
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default {
  query,
  initDatabase,
  pool
};