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

router.post("/", async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: "666094897243-va5s9skf41v0b9suuggja5ipe4ts5oqv.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    let userId = payload["sub"];
    const email = payload["email"];
    const name = payload["name"];
    const avatarUrl = payload["picture"];

    if (!/^[0-9a-fA-F-]{36}$/.test(userId)) {
      userId = uuidv4();
    }

    const user = await db.query(
      `INSERT INTO users (id, email, name, avatar_url, google_id) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO UPDATE 
       SET name = $3, avatar_url = $4, google_id = $5 
       RETURNING *`,
      [userId, email, name, avatarUrl, payload["sub"]]
    );

    res.status(200).json({
      token: `fake-jwt-token-for-${userId}`,
      user: user.rows[0],
    });
  } catch (error) {
    console.error("Erro ao autenticar com Google:", error);
    res.status(400).json({ error: "Autenticação falhou" });
  }
});

module.exports = router;
