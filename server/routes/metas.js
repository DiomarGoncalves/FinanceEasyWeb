import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// Obter todas as metas do usuário
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { mes, ano } = req.query;
    
    let query = `
      SELECT m.*, 
             COALESCE(SUM(d.valor), 0) as valor_gasto
      FROM metas_gastos m
      LEFT JOIN despesas d ON d.categoria = m.categoria 
                           AND d.userId = m.userId 
                           AND EXTRACT(MONTH FROM d.data) = m.mes 
                           AND EXTRACT(YEAR FROM d.data) = m.ano
                           AND d.status != 'cancelada'
      WHERE m.userId = $1 AND m.ativo = true
    `;
    let params = [userId];
    
    if (mes && ano) {
      query += ' AND m.mes = $2 AND m.ano = $3';
      params.push(mes, ano);
    }
    
    query += ' GROUP BY m.id ORDER BY m.categoria';
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar metas' });
  }
});

// Criar nova meta
router.post('/', async (req, res) => {
  const { categoria, valor_limite, mes, ano, descricao, data_inicio, data_fim, cor } = req.body;
  const userId = req.user.id;
  
  try {
    if (!categoria || !valor_limite || !mes || !ano) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    if (parseFloat(valor_limite) <= 0) {
      return res.status(400).json({ error: 'Valor limite deve ser maior que zero' });
    }
    
    const result = await db.query(
      'INSERT INTO metas_gastos (userId, categoria, valor_limite, mes, ano, descricao, data_inicio, data_fim, cor) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [userId, categoria, valor_limite, mes, ano, descricao, data_inicio, data_fim, cor]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Já existe uma meta para esta categoria no período' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar meta' });
  }
});

// Atualizar meta
router.put('/:id', async (req, res) => {
  const { valor_limite, ativo, descricao, data_inicio, data_fim, cor } = req.body;
  const userId = req.user.id;
  const metaId = req.params.id;
  
  try {
    const metaCheck = await db.query(
      'SELECT * FROM metas_gastos WHERE id = $1 AND userId = $2',
      [metaId, userId]
    );
    
    if (metaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }
    
    const result = await db.query(
      'UPDATE metas_gastos SET valor_limite = COALESCE($1, valor_limite), ativo = COALESCE($2, ativo), descricao = COALESCE($3, descricao), data_inicio = COALESCE($4, data_inicio), data_fim = COALESCE($5, data_fim), cor = COALESCE($6, cor) WHERE id = $7 AND userId = $8 RETURNING *',
      [valor_limite, ativo, descricao, data_inicio, data_fim, cor, metaId, userId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar meta' });
  }
});

// Criar aporte para uma meta
router.post('/:id/aportes', async (req, res) => {
  const { valor, descricao, data } = req.body;
  const userId = req.user.id;
  const metaId = req.params.id;
  
  try {
    // Verificar se a meta pertence ao usuário
    const metaCheck = await db.query(
      'SELECT * FROM metas_gastos WHERE id = $1 AND userId = $2',
      [metaId, userId]
    );
    
    if (metaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }
    
    if (!valor || parseFloat(valor) <= 0) {
      return res.status(400).json({ error: 'Valor do aporte deve ser maior que zero' });
    }
    
    const result = await db.query(
      'INSERT INTO aportes_metas (meta_id, valor, descricao, data) VALUES ($1, $2, $3, $4) RETURNING *',
      [metaId, valor, descricao, data || new Date().toISOString().split('T')[0]]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar aporte' });
  }
});

// Obter aportes de uma meta
router.get('/:id/aportes', async (req, res) => {
  try {
    const userId = req.user.id;
    const metaId = req.params.id;
    
    // Verificar se a meta pertence ao usuário
    const metaCheck = await db.query(
      'SELECT * FROM metas_gastos WHERE id = $1 AND userId = $2',
      [metaId, userId]
    );
    
    if (metaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }
    
    const result = await db.query(
      'SELECT * FROM aportes_metas WHERE meta_id = $1 ORDER BY data DESC',
      [metaId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar aportes' });
  }
});

// Excluir meta
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  const metaId = req.params.id;
  
  try {
    const metaCheck = await db.query(
      'SELECT * FROM metas_gastos WHERE id = $1 AND userId = $2',
      [metaId, userId]
    );
    
    if (metaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }
    
    await db.query(
      'DELETE FROM metas_gastos WHERE id = $1 AND userId = $2',
      [metaId, userId]
    );
    
    res.json({ message: 'Meta excluída com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir meta' });
  }
});

export default router;