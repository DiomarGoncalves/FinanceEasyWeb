const express = require("express");
const router = express.Router();
const db = require("../database/db");
const autenticar = require("../middlewares/autenticar"); // Middleware para autenticação

// Rota para listar despesas do usuário autenticado
router.get("/", autenticar, async (req, res) => {
    try {
        const usuarioId = req.user.id; // Obter o ID do usuário autenticado
        console.log("Listando despesas para o usuário:", usuarioId);

        const sql = `
            SELECT d.*, c.nome AS cartao_nome 
            FROM despesas d 
            LEFT JOIN cartoes c ON d.cartao_id = c.id
            WHERE d.usuario_id = $1
        `;

        const result = await db.query(sql, [usuarioId]); // Substituir db.all por db.query
        res.json(result.rows); // Retornar as despesas como JSON
    } catch (error) {
        console.error("Erro inesperado ao listar despesas:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// Rota para adicionar uma nova despesa
router.post("/", autenticar, async (req, res) => {
    const {
        estabelecimento,
        data,
        valor,
        forma_pagamento,
        numero_parcelas,
        cartao_id,
    } = req.body;

    if (!estabelecimento || !data || !valor || !forma_pagamento) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    // Verificar campos obrigatórios para "Cartão de Crédito"
    if (forma_pagamento === "Cartão de Crédito") {
        if (!numero_parcelas || numero_parcelas <= 0) {
            return res.status(400).json({ error: "Número de parcelas é obrigatório para Cartão de Crédito." });
        }
        if (!cartao_id) {
            return res.status(400).json({ error: "Cartão é obrigatório para Cartão de Crédito." });
        }
    }

    try {
        const valorParcela = valor / (numero_parcelas || 1);

        const sql = `
            INSERT INTO despesas (estabelecimento, data, valor, forma_pagamento, numero_parcelas, parcelas_restantes, valor_parcela, cartao_id, usuario_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        const params = [
            estabelecimento,
            data,
            valor,
            forma_pagamento,
            forma_pagamento === "Cartão de Crédito" ? numero_parcelas : 1,
            forma_pagamento === "Cartão de Crédito" ? numero_parcelas : 1,
            forma_pagamento === "Cartão de Crédito" ? valorParcela : valor,
            forma_pagamento === "Cartão de Crédito" ? cartao_id : null,
            req.user.id, // Associar a despesa ao usuário autenticado
        ];

        const result = await db.query(sql, params);
        res.json({ id: result.rows[0]?.id || null, message: "Despesa registrada com sucesso!" });
    } catch (error) {
        console.error("Erro ao adicionar despesa:", error);
        res.status(500).json({ error: "Erro ao adicionar despesa." });
    }
});

// Rota para registrar despesas parceladas
router.post("/parceladas", (req, res) => {
  const { estabelecimento, data, valor, numero_parcelas, forma_pagamento, cartao_id } = req.body;

  if (!estabelecimento || !data || !valor || !numero_parcelas || !forma_pagamento) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  // Normalizar o valor de forma_pagamento
  const formasPagamentoValidas = ["Crédito", "Débito", "Dinheiro", "Pix"];
  const formaPagamentoNormalizada = forma_pagamento
    .replace("Cartão de Crédito", "Crédito")
    .replace("Cartão de Débito", "Débito");

  if (!formasPagamentoValidas.includes(formaPagamentoNormalizada)) {
    return res.status(400).json({ error: "Forma de pagamento inválida." });
  }

  const valorParcela = valor / numero_parcelas;
  const parcelasRestantes = numero_parcelas;

  const sql = `
    INSERT INTO despesas (estabelecimento, data, valor, forma_pagamento, numero_parcelas, parcelas_restantes, valor_parcela, cartao_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [estabelecimento, data, valor, formaPagamentoNormalizada, numero_parcelas, parcelasRestantes, valorParcela, cartao_id || null], function (err) {
    if (err) {
      console.error("Erro ao registrar despesa parcelada:", err.message);
      return res.status(500).json({ error: "Erro ao registrar despesa parcelada." });
    }
    res.json({ id: this.lastID, message: "Despesa parcelada registrada com sucesso!" });
  });
});

// Rota para filtrar despesas
router.post("/filtrar", (req, res) => {
  const { dataInicio, dataFim, nome, banco } = req.body;
  console.log("Recebendo filtros para despesas:", { dataInicio, dataFim, nome, banco });

  let sql = `
    SELECT d.*, c.nome AS cartao_nome, c.banco AS banco_nome 
    FROM despesas d 
    LEFT JOIN cartoes c ON d.cartao_id = c.id 
    WHERE 1=1
  `;
  const params = [];

  if (dataInicio) {
    sql += " AND d.data >= ?";
    params.push(dataInicio);
  }
  if (dataFim) {
    sql += " AND d.data <= ?";
    params.push(dataFim);
  }
  if (nome) {
    sql += " AND d.estabelecimento LIKE ?";
    params.push(`%${nome}%`);
  }
  if (banco) {
    sql += " AND c.banco = ?";
    params.push(banco);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Erro ao filtrar despesas:", err.message);
      res.status(500).json({ error: "Erro ao filtrar despesas" });
    } else {
      res.json(rows);
    }
  });
});

// Rota para pagar uma despesa
router.post("/:id/pagar", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE despesas
    SET paga = 1, parcelas_restantes = CASE WHEN parcelas_restantes > 1 THEN parcelas_restantes - 1 ELSE 0 END
    WHERE id = ?
  `;

  db.run(sql, [id], function (err) {
    if (err) {
      console.error("Erro ao pagar despesa:", err.message);
      return res.status(500).json({ error: "Erro ao pagar despesa." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Despesa não encontrada." });
    }

    res.json({ message: "Despesa paga com sucesso!" });
  });
});

// Rota para excluir uma despesa
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM despesas WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      console.error("Erro ao excluir despesa:", err.message);
      return res.status(500).json({ error: "Erro ao excluir despesa." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Despesa não encontrada." });
    }

    res.json({ message: "Despesa excluída com sucesso!" });
  });
});

module.exports = router;
