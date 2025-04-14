require("dotenv").config(); // Carregar variáveis de ambiente do .env
const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./database/db");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "secreta";

// Middleware para JSON
app.use(express.json());

// Middleware para evitar exposição de variáveis sensíveis
app.use((req, res, next) => {
    if (req.url.includes('DATABASE_URL')) {
        return res.status(403).json({ error: "Acesso proibido" });
    }
    next();
});

// Servir arquivos estáticos
app.use("/pages", express.static(path.join(__dirname, "../pages")));
app.use("/public", express.static(path.join(__dirname)));

// Middleware para autenticação de páginas protegidas
function protegerRota(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        return res.redirect("/login");
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.redirect("/login");
        }
        req.user = user;
        next();
    });
}

// Carregar rotas dinamicamente da pasta "routers"
const routersPath = path.join(__dirname, "routers");
fs.readdirSync(routersPath).forEach((file) => {
    if (file.endsWith(".js")) {
        const route = require(`./routers/${file}`);
        app.use(`/api/${file.replace(".js", "")}`, route);
    }
});

// Rota de login
app.get("/login", (req, res) => {
    const filePath = path.join(__dirname, "pages/usuarios/login/login.html");
    res.sendFile(filePath);
});

// Rota para a página de cadastro (não protegida)
app.get("/cadastro", (req, res) => {
    const filePath = path.join(__dirname, "pages/usuarios/cadastros/cadastro.html");
    res.sendFile(filePath);
});

// Proteger a página inicial
app.get("/pages/home/home.html", protegerRota, (req, res) => {
    const filePath = path.join(__dirname, "pages/home/home.html");
    res.sendFile(filePath);
});

// Redirecionar a rota raiz para a página de login
app.get("/", (req, res) => {
    res.redirect("/login"); // Redirecionar para a página de login
});

// Rota para corrigir problemas de caminhos
app.get("*", (req, res) => {
    res.redirect("/login");
});

// Exemplo de rota para listar cartões
app.get("/api/cartoes", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM cartoes");
        res.json(result.rows); // Retornar os cartões como JSON
    } catch (error) {
        console.error("Erro ao buscar cartões:", error);
        res.status(500).json({ error: "Erro ao buscar cartões" }); // Retornar erro como JSON
    }
});

// Rota para registrar usuários
app.post("/api/usuarios/registro", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        await db.query(
            "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)",
            [nome, email, hashedPassword]
        );
        res.status(201).json({ message: "Usuário registrado com sucesso" });
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        res.status(500).json({ error: "Erro ao registrar usuário" });
    }
});

// Configuração para rodar localmente
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

module.exports = app;
