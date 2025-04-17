const { google } = require("googleapis");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../models/db");

const oauth2Client = new google.auth.OAuth2(
  "666094897243-va5s9skf41v0b9suuggja5ipe4ts5oqv.apps.googleusercontent.com",
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

router.post("/register", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      console.error("Credencial não fornecida.");
      return res.status(400).json({ error: "Credencial não fornecida." });
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: "666094897243-va5s9skf41v0b9suuggja5ipe4ts5oqv.apps.googleusercontent.com",
      clockTolerance: 1800, // Permitir até 30 minutos de diferença
    });

    const payload = ticket.getPayload();
    console.log("Payload recebido do Google:", payload);

    const userId = payload["sub"];
    const email = payload["email"];
    const name = payload["name"];
    const avatarUrl = payload["picture"];

    // Verificar se o usuário já está cadastrado
    const existingUser = await db.query(
      `SELECT * FROM users WHERE google_id = $1`,
      [userId]
    );

    if (existingUser.rows.length > 0) {
      console.error("Usuário já cadastrado.");
      return res.status(400).json({ error: "Usuário já cadastrado." });
    }

    // Inserir novo usuário no banco de dados
    const newUser = await db.query(
      `INSERT INTO users (id, email, name, avatar_url, google_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [uuidv4(), email, name, avatarUrl, userId]
    );

    res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error.message, error.stack);
    res.status(400).json({ 
      error: "Falha ao cadastrar usuário.", 
      details: error.message 
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      console.error("Credencial não fornecida.");
      return res.status(400).json({ error: "Credencial não fornecida." });
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: "666094897243-va5s9skf41v0b9suuggja5ipe4ts5oqv.apps.googleusercontent.com",
      clockTolerance: 1800, // Permitir até 30 minutos de diferença
    });

    const payload = ticket.getPayload();
    console.log("Payload recebido do Google:", payload);

    const userId = payload["sub"];
    const email = payload["email"];

    // Verificar se o usuário está cadastrado
    const user = await db.query(
      `SELECT * FROM users WHERE google_id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      console.error(`Usuário com Google ID ${userId} não encontrado no banco de dados.`);
      return res.status(401).json({ error: "Usuário não cadastrado." });
    }

    console.log(`Usuário autenticado com sucesso: ${email}`);

    // Retornar token e redirecionar para o dashboard
    res.status(200).json({
      token: `fake-jwt-token-for-${userId}`,
      redirect: "/dashboard",
    });
  } catch (error) {
    console.error("Erro ao autenticar com Google:", error.message, error.stack);
    res.status(400).json({ 
      error: "Autenticação falhou", 
      details: error.message 
    });
  }
});

module.exports = router;
