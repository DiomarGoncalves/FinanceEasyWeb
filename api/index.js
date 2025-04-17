require("dotenv").config(); // Carregar variáveis do .env
const express = require("express");
const path = require("path");
const googleAuth = require("./auth/google");
const db = require("./models/db");

const app = express();

app.use(express.json());

// Middleware para verificar autenticação
function isAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Espera o token no formato "Bearer <token>"
  if (!token || !token.startsWith("fake-jwt-token-for-")) {
    return res.redirect("/"); // Redireciona para a página de login
  }
  next();
}

// Servir arquivos estáticos do diretório "public"
app.use(express.static(path.join(__dirname, "../public")));

// Rotas principais
app.use("/api/auth/google", googleAuth);

// Rotas protegidas
app.use("/api/dashboard", isAuthenticated, require("./routes/dashboard"));
app.use("/api/accounts", isAuthenticated, require("./routes/accounts"));
app.use("/api/transactions", isAuthenticated, require("./routes/transactions"));
app.use("/api/credit-cards", isAuthenticated, require("./routes/creditCards"));
app.use("/api/planning", isAuthenticated, require("./routes/planning"));
app.use("/api/reports", isAuthenticated, require("./routes/reports"));
app.use("/api/settings", isAuthenticated, require("./routes/settings"));
app.use("/api/help", isAuthenticated, require("./routes/help"));
app.use("/api/goals", isAuthenticated, require("./routes/goals"));
app.use("/api/categories", isAuthenticated, require("./routes/categories"));
app.use("/api/tags", isAuthenticated, require("./routes/tags"));
app.use("/api/calendar", isAuthenticated, require("./routes/calendar"));
app.use("/api/performance", isAuthenticated, require("./routes/performance"));
app.use("/api/import-transactions", isAuthenticated, require("./routes/importTransactions"));
app.use("/api/export-transactions", isAuthenticated, require("./routes/exportTransactions"));

// Rotas para servir páginas HTML protegidas
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/home/index.html"));
});

app.get("/accounts", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/contas/index.html"));
});

app.get("/transactions", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/transacoes/index.html"));
});

app.get("/credit-cards", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/cartao-credito/index.html"));
});

app.get("/planning", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/planejamento/index.html"));
});

app.get("/reports", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/relatorios/index.html"));
});

app.get("/settings", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/configuracoes/index.html"));
});

app.get("/help", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/ajuda/index.html"));
});

app.get("/goals", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/objetivos.html"));
});

app.get("/categories", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/categorias.html"));
});

app.get("/tags", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/tags.html"));
});

app.get("/calendar", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/calendario.html"));
});

app.get("/performance", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/desempenho.html"));
});

app.get("/import-transactions", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/importar-transacoes.html"));
});

app.get("/export-transactions", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mais-opcoes/exportar-transacoes.html"));
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
