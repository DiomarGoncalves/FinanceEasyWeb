const express = require("express");
const googleAuth = require("./auth/google");
const path = require("path");

const app = express();

app.use(express.json());

// Rotas principais
app.use("/api/auth/google", googleAuth);

app.get("/api", (req, res) => {
  res.send("API do FinanceEasy está funcionando!");
});
app.get("*", (req, res) => {
    const filePath = path.join(__dirname, "../public/login.html");
    res.sendFile(filePath);
});

// Rotas para as telas do sistema
app.get("/api/dashboard", (req, res) => res.send("Dashboard"));
app.get("/api/contas", (req, res) => res.send("Contas"));
app.get("/api/transacoes", (req, res) => res.send("Transações"));
app.get("/api/cartao-credito", (req, res) => res.send("Cartões de crédito"));
app.get("/api/planejamento", (req, res) => res.send("Planejamento"));
app.get("/api/relatorios", (req, res) => res.send("Relatórios"));
app.get("/api/configuracoes", (req, res) => res.send("Configurações"));
app.get("/api/ajuda", (req, res) => res.send("Central de Ajuda"));

// Submenu "Mais opções"
app.get("/api/mais-opcoes/objetivos", (req, res) => res.send("Objetivos"));
app.get("/api/mais-opcoes/categorias", (req, res) => res.send("Categorias"));
app.get("/api/mais-opcoes/tags", (req, res) => res.send("Tags"));
app.get("/api/mais-opcoes/calendario", (req, res) => res.send("Calendário"));
app.get("/api/mais-opcoes/desempenho", (req, res) => res.send("Meu Desempenho"));
app.get("/api/mais-opcoes/importar-transacoes", (req, res) => res.send("Importar transações"));
app.get("/api/mais-opcoes/exportar-transacoes", (req, res) => res.send("Exportar transações"));

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
