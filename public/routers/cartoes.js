const express = require("express");
const router = express.Router();
const db = require("../database/db");

// Rota para listar cartões
router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM cartoes");
        res.json(result.rows); // Retornar os cartões como JSON
    } catch (error) {
        console.error("Erro ao buscar cartões:", error);
        res.status(500).json({ error: "Erro ao buscar cartões" });
    }
});

// Rota para adicionar um cartão
router.post("/", async (req, res) => {
  const { nome, banco, limite, vencimento } = req.body;

  if (!nome || !banco || !limite || !vencimento) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const sql = `INSERT INTO cartoes (nome, banco, limite, vencimento) VALUES ($1, $2, $3, $4)`;
  try {
    const result = await db.query(sql, [nome, banco, limite, vencimento]);
    res.status(201).json({ id: result.rows[0]?.id || null });
  } catch (err) {
    console.error("Erro ao adicionar cartão:", err);
    res.status(500).json({ error: "Erro ao adicionar cartão" });
  }
});

// Rota para atualizar um cartão
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nome, banco, limite } = req.body;
  const sql = `UPDATE cartoes SET nome = ?, banco = ?, limite = ? WHERE id = ?`;
  db.run(sql, [nome, banco, limite, id], function (err) {
    if (err) {
      console.error("Erro ao atualizar cartão:", err);
      res.status(500).json({ error: "Erro ao atualizar cartão" });
    } else {
      res.json({ changes: this.changes });
    }
  });
});

// Rota para excluir um cartão
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM cartoes WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      console.error("Erro ao excluir cartão:", err);
      res.status(500).json({ error: "Erro ao excluir cartão" });
    } else {
      res.json({ changes: this.changes });
    }
  });
});

module.exports = router;
