const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const JWT_SECRET = process.env.JWT_SECRET || "secreta";

// Middleware para verificar autenticação
const autenticar = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Rota para registrar usuários
router.post("/registro", async (req, res) => {
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
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    try {
        const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Senha incorreta" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login bem-sucedido", token });
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ error: "Erro ao fazer login" });
    }
});

// Exemplo de rota protegida com verificação de propriedade
router.get("/perfil", autenticar, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM usuarios WHERE id = $1", [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ error: "Erro ao buscar perfil" });
    }
});

// Atualize outras rotas para incluir a verificação de propriedade
router.get("/dados-sensiveis", autenticar, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM dados WHERE usuario_id = $1", [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        res.status(500).json({ error: "Erro ao buscar dados" });
    }
});

// Exemplo de rota protegida para listar cartões do usuário autenticado
router.get("/cartoes", autenticar, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM cartoes WHERE usuario_id = $1", [req.user.id]); // Filtrar pelo usuario_id
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar cartões:", error);
        res.status(500).json({ error: "Erro ao buscar cartões" });
    }
});

// Exemplo de rota protegida para listar despesas do usuário autenticado
router.get("/despesas", autenticar, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM despesas WHERE usuario_id = $1", [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar despesas:", error);
        res.status(500).json({ error: "Erro ao buscar despesas" });
    }
});

module.exports = router;
