require("dotenv").config(); // Carregar variáveis do .env
const express = require("express");
const path = require("path");
const googleAuth = require("./auth/google");
const db = require("./models/db");

const app = express();

app.use(express.json());

// Middleware para verificar autenticação
async function isAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Espera o token no formato "Bearer <token>"
  const userId = req.headers["user-id"]; // Recuperar o userId do cabeçalho

  if (!token || !token.startsWith("fake-jwt-token-for-") || !userId) {
    console.error("Token ou userId ausente ou inválido.");
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  const extractedUserId = token.replace("fake-jwt-token-for-", ""); // Extrair o userId do token
  if (extractedUserId !== userId) {
    console.error("Token não corresponde ao userId.");
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const user = await db.query(`SELECT * FROM users WHERE id = $1`, [userId]);
    if (user.rows.length === 0) {
      console.error("Usuário não encontrado no banco de dados.");
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    console.log("Usuário autenticado com sucesso:", user.rows[0].email);
    next();
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error.message);
    return res.status(500).json({ error: "Erro interno ao verificar autenticação." });
  }
}

// Servir arquivos estáticos do diretório "public"
app.use(express.static(path.join(__dirname, "../public")));

// Rotas principais
app.use("/api/auth/google", googleAuth);

// Rotas protegidas (sem autenticação temporariamente)
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/accounts", require("./routes/accounts"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/credit-cards", require("./routes/creditCards"));
app.use("/api/cards", require("./routes/creditCards"));
app.use("/api/planning", require("./routes/planning"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/help", require("./routes/help"));
app.use("/api/goals", require("./routes/goals"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/tags", require("./routes/tags"));
app.use("/api/calendar", require("./routes/calendar"));
app.use("/api/performance", require("./routes/performance"));
app.use("/api/import-transactions", require("./routes/importTransactions"));
app.use("/api/export-transactions", require("./routes/exportTransactions"));

// Rotas para servir páginas HTML (sem autenticação temporariamente)
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/home/index.html"));
});

app.get("/accounts", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/contas/index.html"));
});

app.get("/transactions", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/transacoes/index.html"));
});

app.get("/credit-cards", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/cartao-credito/index.html"));
});

app.get("/planning", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/planejamento/index.html"));
});

app.get("/reports", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/relatorios/index.html"));
});

app.get("/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/configuracoes/index.html"));
});

app.get("/help", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/ajuda/index.html"));
});

app.get("/goals", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/objetivos.html"));
});

app.get("/categories", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/categorias.html"));
});

app.get("/tags", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/tags.html"));
});

app.get("/calendar", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/calendario.html"));
});

app.get("/performance", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/desempenho.html"));
});

app.get("/import-transactions", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/importar-transacoes.html"));
});

app.get("/export-transactions", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/exportar-transacoes.html"));
});

// Rota para a página de cadastro (sem autenticação)
app.get("/cadastrar", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/cadastro.html"));
});

// Rota para a página inicial
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "../public/index.html");
  res.sendFile(filePath);
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
