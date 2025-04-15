const express = require("express");
const router = express.Router();
const db = require("../database/db");
const jwt = require("jsonwebtoken");

// Middleware para verificar o token e extrair o usuario_id
function autenticarUsuario(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreta");
    req.usuario_id = decoded.id;
    next();
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    res.status(401).json({ error: "Token inválido" });
  }
}

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
router.post("/", autenticarUsuario, async (req, res) => {
  const { nome, banco, limite, vencimento } = req.body;
  const usuario_id = req.usuario_id;

  if (!nome || !banco || !limite || !vencimento || !usuario_id) {
    console.error("Erro: Campos obrigatórios ausentes", { nome, banco, limite, vencimento, usuario_id });
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  // Validação do formato da data (YYYY-MM-DD)
  const vencimentoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!vencimentoRegex.test(vencimento)) {
    console.error("Erro: Formato de data inválido para vencimento:", vencimento);
    return res.status(400).json({ error: "O campo 'vencimento' deve estar no formato 'YYYY-MM-DD'" });
  }

  const sql = `INSERT INTO cartoes (nome, banco, limite, vencimento, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
  try {
    const result = await db.query(sql, [nome, banco, limite, vencimento, usuario_id]);
    console.log("Cartão adicionado com sucesso:", result.rows[0]);
    res.status(201).json({ id: result.rows[0]?.id });
  } catch (err) {
    console.error("Erro ao adicionar cartão:", err.message);
    res.status(500).json({ error: "Erro ao adicionar cartão" });
  }
});

// Rota para atualizar um cartão
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, banco, limite } = req.body;

  if (!id || !nome || !banco || !limite) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const sql = `UPDATE cartoes SET nome = $1, banco = $2, limite = $3 WHERE id = $4`;
  try {
    const result = await db.query(sql, [nome, banco, limite, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cartão não encontrado" });
    }
    res.json({ message: "Cartão atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar cartão:", err);
    res.status(500).json({ error: "Erro ao atualizar cartão" });
  }
});

// Rota para excluir um cartão
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID do cartão é obrigatório" });
  }

  const sql = `DELETE FROM cartoes WHERE id = $1`;
  try {
    const result = await db.query(sql, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cartão não encontrado" });
    }
    res.json({ message: "Cartão excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir cartão:", err);
    res.status(500).json({ error: "Erro ao excluir cartão" });
  }
});

module.exports = router;
