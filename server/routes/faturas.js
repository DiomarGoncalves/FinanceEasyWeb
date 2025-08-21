import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// Obter todas as faturas do usuário
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { mes, ano, cartaoId } = req.query;
    
    let query = `
      SELECT f.*, c.nome as cartao_nome, c.numero as cartao_numero
      FROM faturas f
      JOIN cartoes c ON c.id = f.cartaoId
      WHERE f.userId = $1
    `;
    let params = [userId];
    
    if (mes && ano) {
      query += ' AND f.mes_referencia = $2 AND f.ano_referencia = $3';
      params.push(mes, ano);
      
      if (cartaoId) {
        query += ' AND f.cartaoId = $4';
        params.push(cartaoId);
      }
    } else if (cartaoId) {
      query += ' AND f.cartaoId = $2';
      params.push(cartaoId);
    }
    
    query += ' ORDER BY f.ano_referencia DESC, f.mes_referencia DESC';
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar faturas' });
  }
});

// Obter faturas de um cartão específico
router.get('/cartao/:cartaoId', async (req, res) => {
  try {
    const userId = req.user.id;
    const cartaoId = req.params.cartaoId;
    
    // Verificar se o cartão pertence ao usuário
    const cartaoCheck = await db.query(
      'SELECT * FROM cartoes WHERE id = $1 AND userId = $2',
      [cartaoId, userId]
    );
    
    if (cartaoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }
    
    const result = await db.query(
      `SELECT f.*, c.nome as cartao_nome, c.numero as cartao_numero
       FROM faturas f
       JOIN cartoes c ON c.id = f.cartaoId
       WHERE f.cartaoId = $1 AND f.userId = $2
       ORDER BY f.ano_referencia DESC, f.mes_referencia DESC`,
      [cartaoId, userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar faturas do cartão' });
  }
});

// Obter uma fatura específica com suas despesas
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const faturaId = req.params.id;
    
    // Buscar fatura
    const faturaResult = await db.query(
      `SELECT f.*, c.nome as cartao_nome, c.numero as cartao_numero
       FROM faturas f
       JOIN cartoes c ON c.id = f.cartaoId
       WHERE f.id = $1 AND f.userId = $2`,
      [faturaId, userId]
    );
    
    if (faturaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }
    
    // Buscar despesas da fatura
    const despesasResult = await db.query(
      'SELECT * FROM despesas WHERE faturaId = $1 AND userId = $2 ORDER BY data DESC',
      [faturaId, userId]
    );
    
    const fatura = faturaResult.rows[0];
    fatura.despesas = despesasResult.rows;
    
    res.json(fatura);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar fatura' });
  }
});

// Criar nova fatura
router.post('/', async (req, res) => {
  const { cartaoId, mes_referencia, ano_referencia, valor_total, status } = req.body;
  const userId = req.user.id;
  
  try {
    if (!cartaoId || !mes_referencia || !ano_referencia || valor_total === undefined) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    // Verificar se o cartão pertence ao usuário
    const cartaoCheck = await db.query(
      'SELECT * FROM cartoes WHERE id = $1 AND userId = $2',
      [cartaoId, userId]
    );
    
    if (cartaoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }
    
    // Verificar se já existe fatura para este cartão no período
    const faturaExistente = await db.query(
      'SELECT * FROM faturas WHERE cartaoId = $1 AND mes_referencia = $2 AND ano_referencia = $3 AND userId = $4',
      [cartaoId, mes_referencia, ano_referencia, userId]
    );
    
    if (faturaExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Já existe uma fatura para este cartão no período' });
    }
    
    const result = await db.query(
      'INSERT INTO faturas (userId, cartaoId, mes_referencia, ano_referencia, valor_total, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, cartaoId, mes_referencia, ano_referencia, valor_total || 0, status || 'aberta']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar fatura' });
  }
});

// Atualizar fatura
router.put('/:id', async (req, res) => {
  const { valor_total, status } = req.body;
  const userId = req.user.id;
  const faturaId = req.params.id;
  
  try {
    // Verificar se a fatura pertence ao usuário
    const faturaCheck = await db.query(
      'SELECT * FROM faturas WHERE id = $1 AND userId = $2',
      [faturaId, userId]
    );
    
    if (faturaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }
    
    // Atualizar fatura
    const result = await db.query(
      'UPDATE faturas SET valor_total = COALESCE($1, valor_total), status = COALESCE($2, status) WHERE id = $3 AND userId = $4 RETURNING *',
      [valor_total, status, faturaId, userId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar fatura' });
  }
});

// Pagar fatura (parcial ou total)
router.post('/:id/pagar', async (req, res) => {
  const { valor_pagamento } = req.body;
  const userId = req.user.id;
  const faturaId = req.params.id;
  
  try {
    if (!valor_pagamento || parseFloat(valor_pagamento) <= 0) {
      return res.status(400).json({ error: 'Valor de pagamento inválido' });
    }
    
    // Verificar se a fatura pertence ao usuário
    const faturaCheck = await db.query(
      'SELECT * FROM faturas WHERE id = $1 AND userId = $2',
      [faturaId, userId]
    );
    
    if (faturaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }
    
    const fatura = faturaCheck.rows[0];
    const valorPagamento = parseFloat(valor_pagamento);
    const novoValor = Math.max(0, parseFloat(fatura.valor_total) - valorPagamento);
    const novoStatus = novoValor === 0 ? 'paga' : 'aberta';
    
    // Atualizar fatura
    const result = await db.query(
      'UPDATE faturas SET valor_total = $1, status = $2 WHERE id = $3 AND userId = $4 RETURNING *',
      [novoValor, novoStatus, faturaId, userId]
    );
    
    res.json({
      message: 'Pagamento realizado com sucesso',
      fatura: result.rows[0],
      valor_pago: valorPagamento
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

// Excluir fatura
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  const faturaId = req.params.id;
  
  try {
    // Verificar se a fatura pertence ao usuário
    const faturaCheck = await db.query(
      'SELECT * FROM faturas WHERE id = $1 AND userId = $2',
      [faturaId, userId]
    );
    
    if (faturaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }
    
    // Excluir fatura (as despesas relacionadas terão faturaId definido como NULL)
    await db.query(
      'UPDATE despesas SET faturaId = NULL WHERE faturaId = $1 AND userId = $2',
      [faturaId, userId]
    );
    
    await db.query(
      'DELETE FROM faturas WHERE id = $1 AND userId = $2',
      [faturaId, userId]
    );
    
    res.json({ message: 'Fatura excluída com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir fatura' });
  }
});

export default router;