const express = require("express");
const { v4: uuidv4, validate: isUuid } = require("uuid");
const db = require("../models/db");
const router = express.Router();

// Validação do user-id
async function validateUserId(userId, res) {
  if (!isUuid(userId)) {
    console.error("user-id inválido:", userId);
    res.status(400).json({ error: "user-id inválido." });
    return false;
  }

  try {
    const user = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (user.rows.length === 0) {
      console.error("Usuário não encontrado:", userId);
      res.status(404).json({ error: "Usuário não encontrado." });
      return false;
    }
  } catch (error) {
    console.error("Erro ao validar user-id:", error.message);
    res.status(500).json({ error: "Erro ao validar user-id." });
    return false;
  }

  return true;
}

// Listar Cartões de Crédito
router.get("/", async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!await validateUserId(userId, res)) return;

    const result = await db.query("SELECT * FROM credit_cards WHERE user_id = $1", [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao listar cartões:", error.message);
    res.status(500).json({ error: "Erro ao listar cartões." });
  }
});

// Adicionar um Novo Cartão
router.post("/", async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!await validateUserId(userId, res)) return;

    const { name, brand, credit_limit, available_limit, due_day, closing_day, description, tag } = req.body;

    const result = await db.query(
      `INSERT INTO credit_cards (id, user_id, name, brand, credit_limit, available_limit, due_day, closing_day, description, tag) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [uuidv4(), userId, name, brand, credit_limit, available_limit, due_day, closing_day, description, tag]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23503") { // Código de erro para violação de chave estrangeira
      console.error("Erro de chave estrangeira: user_id não encontrado:", error.message);
      res.status(400).json({ error: "Usuário não encontrado. Certifique-se de que o user_id é válido." });
    } else {
      console.error("Erro ao adicionar cartão:", error.message);
      res.status(500).json({ error: "Erro ao adicionar cartão." });
    }
  }
});

// Editar um Cartão Existente
router.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!await validateUserId(userId, res)) return;

    const { id } = req.params;
    const { name, brand, credit_limit, available_limit, due_day, closing_day, description, tag } = req.body;

    const result = await db.query(
      `UPDATE credit_cards 
       SET name = $1, brand = $2, credit_limit = $3, available_limit = $4, due_day = $5, closing_day = $6, description = $7, tag = $8, updated_at = NOW()
       WHERE id = $9 AND user_id = $10 RETURNING *`,
      [name, brand, credit_limit, available_limit, due_day, closing_day, description, tag, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cartão não encontrado ou não pertence ao usuário." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao editar cartão:", error.message);
    res.status(500).json({ error: "Erro ao editar cartão." });
  }
});

// Excluir um Cartão
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!await validateUserId(userId, res)) return;

    const { id } = req.params;

    const result = await db.query("DELETE FROM credit_cards WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cartão não encontrado ou não pertence ao usuário." });
    }

    res.status(200).json({ message: "Cartão excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir cartão:", error.message);
    res.status(500).json({ error: "Erro ao excluir cartão." });
  }
});

// Ver Detalhes de um Cartão
router.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!await validateUserId(userId, res)) return;

    const { id } = req.params;

    const result = await db.query("SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2", [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cartão não encontrado ou não pertence ao usuário." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar detalhes do cartão:", error.message);
    res.status(500).json({ error: "Erro ao buscar detalhes do cartão." });
  }
});

module.exports = router;
