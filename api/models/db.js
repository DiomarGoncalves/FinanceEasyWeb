const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://FinancEasyWeb_owner:npg_su5NWb1AGnZr@ep-tiny-pine-a4tdvgyi-pooler.us-east-1.aws.neon.tech/FinancEasyWeb?sslmode=require",
  ssl: { rejectUnauthorized: false }, // Configuração para aceitar conexões SSL
  connectionTimeoutMillis: 10000, // Aumentar o tempo limite para 10 segundos
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
