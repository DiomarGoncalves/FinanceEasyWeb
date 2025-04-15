require("dotenv").config(); // Carregar variáveis de ambiente do .env
const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require("pg"); // Usar apenas pg para PostgreSQL

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "secreta";

// Configuração do banco de dados PostgreSQL
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Necessário para conexões seguras no Neon
});

// Middleware para JSON
app.use(express.json());

// Middleware para registrar todas as solicitações e respostas
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.on("finish", () => {
    console.log(`[${new Date().toISOString()}] Resposta: ${res.statusCode}`);
  });
  next();
});

// Middleware para evitar exposição de variáveis sensíveis
app.use((req, res, next) => {
    if (req.url.includes('DATABASE_URL')) {
        return res.status(403).json({ error: "Acesso proibido" });
    }
    next();
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "../public"))); // Corrigir o caminho para a pasta "public")
app.use("/pages", express.static(path.join(__dirname, "../pages")));

// Middleware para autenticação de páginas protegidas
function protegerRota(req, res, next) {
    const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Acesso não autorizado" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ error: "Token inválido" });
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
        app.use(`/api/${file.replace(".js", "")}`, route); // Registrar a rota
    }
});

// Rotas de páginas
app.get("/pages/usuarios/login/login.html", (req, res) => {
    const filePath = path.join(__dirname, "../public/pages/usuarios/login/login.html"); // Corrigir o caminho
    res.sendFile(filePath);
});

app.get("/pages/usuarios/cadastros/cadastro.html", (req, res) => {
    const filePath = path.join(__dirname, "public/pages/usuarios/cadastros/cadastro.html"); // Corrigir o caminho
    res.sendFile(filePath);
});

app.get("/pages/home/home.html", protegerRota, (req, res) => {
    const filePath = path.join(__dirname, "public/pages/home/home.html"); // Corrigir o caminho
    res.sendFile(filePath);
});

// Redirecionar a rota raiz para a página de login
app.get("/", (req, res) => {
    res.redirect("/pages/usuarios/login/login.html"); // Certifique-se de que o redirecionamento está correto
});

app.get("*", (req, res) => {
    res.redirect("/pages/usuarios/login/login.html");
});

// Exemplo de rota protegida para listar cartões
app.get("/api/cartoes", protegerRota, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM cartoes WHERE usuario_id = $1", [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar cartões:", error);
        res.status(500).json({ error: "Erro ao buscar cartões" });
    }
});

// Exemplo de rota protegida para listar despesas
app.get("/api/despesas", protegerRota, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM despesas WHERE usuario_id = $1", [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar despesas:", error);
        res.status(500).json({ error: "Erro ao buscar despesas" });
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

// Rota para login de usuários
app.post("/api/usuarios/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        console.log("Campos obrigatórios ausentes:", { email, senha });
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    try {
        const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user) {
            console.log("Usuário não encontrado:", email);
            return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            console.log("Senha incorreta para o usuário:", email);
            return res.status(401).json({ error: "Senha incorreta" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        console.log("Login bem-sucedido para o usuário:", email);
        res.json({ message: "Login bem-sucedido", token });
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ error: "Erro ao fazer login" });
    }
});

const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/usuarios", require("./routers/usuarios"));
app.use("/api/teste", require("./routers/teste"));
app.use("/api/reservas", require("./routers/reservas"));
app.use("/api/receitas", require("./routers/receitas"));
app.use("/api/objetivo", require("./routers/objetivo"));
app.use("/api/notificacoes", require("./routers/notificacoes"));
app.use("/api/investimentos", require("./routers/investimentos"));
app.use("/api/historico", require("./routers/historico"));
app.use("/api/despesas", require("./routers/despesas"));
app.use("/api/dashboard", require("./routers/dashboard"));
app.use("/api/configuracoes", require("./routers/configuracoes"));
app.use("/api/comissoes", require("./routers/comissoes"));
app.use("/api/cartoes", require("./routers/cartoes"));

// Middleware para capturar erros 404 e redirecionar para uma página de erro
app.use((req, res, next) => {
    if (req.accepts("html")) {
        res.status(404).sendFile(path.join(__dirname, "pages/404.html"));
    } else {
        res.status(404).json({ error: "Recurso não encontrado" });
    }
});

// Middleware global para capturar erros
app.use((err, req, res, next) => {
    console.error("Erro no servidor:", err.stack);
    res.status(500).json({ error: "Erro interno do servidor" });
});

// Configuração para rodar localmente
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

module.exports = app;
