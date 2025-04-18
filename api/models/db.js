const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Configuração para aceitar conexões SSL
});

// Testar conexão ao banco de dados
pool.connect((err, client, release) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
