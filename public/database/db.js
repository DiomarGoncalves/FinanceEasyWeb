require('dotenv').config(); // Carregar variáveis de ambiente do arquivo .env
const { Pool } = require('pg');

// Configuração do banco de dados PostgreSQL (Neon)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // URL do banco de dados Neon
    ssl: { rejectUnauthorized: false } // Necessário para conexões seguras com Neon
});

// Função para executar queries
const db = {
    query: (text, params) => pool.query(text, params),
};

module.exports = db;
