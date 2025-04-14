const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

const JWT_SECRET = process.env.JWT_SECRET || "secreta";

// Rota de registro
router.post("/registro", async (req, res) => {
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
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(senha, user.senha))) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });
        res.json({ message: "Login bem-sucedido" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao fazer login" });
    }
});

module.exports = router;
