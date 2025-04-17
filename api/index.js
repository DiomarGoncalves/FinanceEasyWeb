require("dotenv").config(); // Carregar variáveis do .env
const express = require("express");
const path = require("path");
const googleAuth = require("./auth/google");
const db = require("./models/db");

const app = express();

app.use(express.json());

// Servir arquivos estáticos do diretório "public"
app.use(express.static(path.join(__dirname, "../public")));

// Rotas principais
app.use("/api/auth/google", googleAuth);

// Rotas para as telas do sistema
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/accounts", require("./routes/accounts"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/credit-cards", require("./routes/creditCards"));
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

// Rota para fornecer o client_id ao frontend
app.get("/api/client-id", (req, res) => {
  res.json({ client_id: process.env.GOOGLE_CLIENT_ID });
});

// Rota para a página inicial
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "../public/login.html");
  res.sendFile(filePath);
});

// Rota para capturar todas as outras requisições
app.get("*", (req, res) => {
  const filePath = path.join(__dirname, "../public/404.html"); // Página 404 personalizada
  res.sendFile(filePath);
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
