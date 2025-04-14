const express = require("express");
const router = express.Router();
const db = require("../database/db.js");

// Rota para obter dados do dashboard
router.get("/", async (req, res) => {
  try {
    const mesAtual = new Date().getMonth() + 1; // Mês atual (1-12)
    const anoAtual = new Date().getFullYear(); // Ano atual
    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1; // Mês anterior
    const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual; // Ano do mês anterior

    const mesFormatado = String(mesAtual).padStart(2, "0");
    const mesAnteriorFormatado = String(mesAnterior).padStart(2, "0");

    const saldoQuery = `
      SELECT 
        (SELECT IFNULL(SUM(valor), 0) FROM receitas WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?) - 
        (SELECT IFNULL(SUM(valor), 0) FROM despesas WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?) AS saldoAtual
    `;
    const despesasQuery = `
      SELECT IFNULL(SUM(valor), 0) AS totalDespesas 
      FROM despesas 
      WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?
    `;
    const receitasQuery = `
      SELECT IFNULL(SUM(valor), 0) AS totalReceitas 
      FROM receitas 
      WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?
    `;
    const comparativoQuery = `
      SELECT 
        (SELECT IFNULL(SUM(valor), 0) FROM receitas WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?) -
        (SELECT IFNULL(SUM(valor), 0) FROM despesas WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?) AS saldoAnterior
    `;

    const [saldo, despesas, receitas, comparativo] = await Promise.all([
      db.query(saldoQuery, [mesFormatado, anoAtual, mesFormatado, anoAtual]),
      db.query(despesasQuery, [mesFormatado, anoAtual]),
      db.query(receitasQuery, [mesFormatado, anoAtual]),
      db.query(comparativoQuery, [mesAnteriorFormatado, anoAnterior, mesAnteriorFormatado, anoAnterior]),
    ]);

    res.json({
      saldoAtual: saldo?.rows[0]?.saldoAtual || 0,
      totalDespesas: despesas?.rows[0]?.totalDespesas || 0,
      totalReceitas: receitas?.rows[0]?.totalReceitas || 0,
      comparativoMesAnterior: comparativo?.rows[0]?.saldoAnterior || 0,
    });
  } catch (error) {
    console.error("Erro ao obter dados do dashboard:", error);
    res.status(500).json({ error: "Erro ao obter dados do dashboard" });
  }
});

// Rota para retornar dados mensais do dashboard
router.get("/mensal", async (req, res) => {
  try {
    const { mes, ano } = req.query;

    if (!mes || !ano || isNaN(mes) || isNaN(ano)) {
      return res.status(400).json({ error: "Parâmetros 'mes' e 'ano' são obrigatórios e devem ser números." });
    }

    const mesFormatado = mes.padStart(2, "0");

    const saldoQuery = `
      SELECT 
        (SELECT IFNULL(SUM(valor), 0) FROM receitas WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?) - 
        (SELECT IFNULL(SUM(valor), 0) FROM despesas WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?) AS saldoAtual
    `;
    const despesasQuery = `
      SELECT IFNULL(SUM(valor), 0) AS totalDespesas 
      FROM despesas 
      WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?
    `;
    const receitasQuery = `
      SELECT IFNULL(SUM(valor), 0) AS totalReceitas 
      FROM receitas 
      WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?
    `;
    const desempenhoQuery = `
      SELECT 
        strftime('%m', data) AS mes, 
        SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) AS despesas,
        SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) AS receitas
      FROM (
        SELECT data, valor, 'despesa' AS tipo FROM despesas
        UNION ALL
        SELECT data, valor, 'receita' AS tipo FROM receitas
      )
      WHERE strftime('%Y', data) = ?
      GROUP BY mes
      ORDER BY mes
    `;

    const [saldo, despesas, receitas, desempenho] = await Promise.all([
      db.query(saldoQuery, [mesFormatado, ano, mesFormatado, ano]),
      db.query(despesasQuery, [mesFormatado, ano]),
      db.query(receitasQuery, [mesFormatado, ano]),
      db.query(desempenhoQuery, [ano]),
    ]);

    const desempenhoMensal = {
      meses: desempenho.rows.map((d) => d.mes),
      despesas: desempenho.rows.map((d) => d.despesas),
      receitas: desempenho.rows.map((d) => d.receitas),
    };

    res.json({
      saldoAtual: saldo?.rows[0]?.saldoAtual || 0,
      totalDespesas: despesas?.rows[0]?.totalDespesas || 0,
      totalReceitas: receitas?.rows[0]?.totalReceitas || 0,
      desempenhoMensal: desempenhoMensal.meses.length ? desempenhoMensal : { meses: [], despesas: [], receitas: [] },
    });
  } catch (error) {
    console.error("Erro ao obter dados mensais do dashboard:", error);
    res.status(500).json({ error: "Erro ao obter dados mensais do dashboard" });
  }
});

module.exports = router;
