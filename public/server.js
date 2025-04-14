const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./database/db");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "secreta";

// Middleware para JSON
app.use(express.json());

// Servir arquivos estáticos da pasta "pages"
app.use("/pages", express.static(path.join(__dirname, "../pages")));

// Servir arquivos estáticos da pasta "public"
app.use("/public", express.static(path.join(__dirname)));

// Middleware para autenticação
function autenticarToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token não fornecido" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token inválido" });
        req.user = user;
        next();
    });
}

// Rota de registro
app.post("/api/usuarios/registro", async (req, res) => {
    const { nome, email, senha } = req.body;
    const hashedSenha = await bcrypt.hash(senha, 10);

    try {
        await db.query("INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)", [nome, email, hashedSenha]);
        res.status(201).json({ message: "Usuário registrado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao registrar usuário" });
    }
});

// Rota de login
app.post("/api/usuarios/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(senha, user.senha))) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Erro ao fazer login" });
    }
});

// Exemplo de rota protegida
app.get("/api/protegida", autenticarToken, (req, res) => {
    res.json({ message: "Acesso autorizado", user: req.user });
});

// Exemplo de rota para listar cartões
app.get("/api/cartoes", autenticarToken, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM cartoes WHERE usuario_id = $1", [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar cartões:", error);
        res.status(500).json({ error: "Erro ao buscar cartões" });
    }
});

// Rota para servir qualquer página HTML dentro da pasta "pages"
app.get("/pages/:folder/:file", (req, res) => {
    const { folder, file } = req.params;
    const filePath = path.join(__dirname, `../pages/${folder}/${file}`);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send("Página não encontrada");
    }
});

// Rota para corrigir problemas de caminhos
app.get("*", (req, res) => {
    const filePath = path.join(__dirname, "../pages/home/home.html");
    res.sendFile(filePath);
});

// Exportar o app para ser usado pela Vercel
module.exports = app;
