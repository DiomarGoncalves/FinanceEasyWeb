import React, { useState, useEffect } from 'react';
import { Plus, Target, Trash2, Edit, AlertCircle, TrendingUp, PiggyBank, Calendar, XCircle, DollarSign } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

interface Meta {
  id: number;
  categoria: string;
  valor_limite: number;
  valor_gasto: number;
  valor_poupado?: number;
  data_inicio: string;
  data_fim: string;
  descricao?: string;
  cor?: string;
  mes: number;
  ano: number;
  ativo: boolean;
}

interface Aporte {
  id: number;
  meta_id: number;
  valor: number;
  data: string;
  descricao?: string;
}

const Metas: React.FC = () => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [aportes, setAportes] = useState<{ [metaId: number]: Aporte[] }>({});
  const [showForm, setShowForm] = useState(false);
  const [showAporteModal, setShowAporteModal] = useState<{ open: boolean, meta: Meta | null }>({ open: false, meta: null });
  const [editId, setEditId] = useState<number | null>(null);
  const [categoria, setCategoria] = useState('');
  const [valorLimite, setValorLimite] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [cor, setCor] = useState('#147361');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [valorAporte, setValorAporte] = useState('');
  const [descricaoAporte, setDescricaoAporte] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const categorias = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Viagem',
    'Emergência',
    'Investimento',
    'Outros'
  ];

  const coresDisponiveis = [
    '#147361', '#285950', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
  ];

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    loadMetas();
  }, [mes, ano]);

  const loadMetas = async () => {
    try {
      const response = await api.get(`/metas?mes=${mes}&ano=${ano}`);
      setMetas(response.data);
      
      // Carregar aportes para cada meta
      for (const meta of response.data) {
        loadAportes(meta.id);
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    }
  };

  const loadAportes = async (metaId: number) => {
    try {
      const response = await api.get(`/metas/${metaId}/aportes`);
      setAportes(prev => ({ ...prev, [metaId]: response.data }));
    } catch (error) {
      console.error('Erro ao carregar aportes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!categoria || !valorLimite || !dataInicio || !dataFim) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/metas/${editId}`, {
          valor_limite: parseFloat(valorLimite),
          descricao,
          data_inicio: dataInicio,
          data_fim: dataFim,
          cor
        });
        showToast({
          type: 'success',
          title: 'Meta atualizada!',
          message: 'Meta atualizada com sucesso'
        });
      } else {
        await api.post('/metas', {
          categoria,
          valor_limite: parseFloat(valorLimite),
          descricao,
          data_inicio: dataInicio,
          data_fim: dataFim,
          cor,
          mes,
          ano
        });
        showToast({
          type: 'success',
          title: 'Meta criada!',
          message: 'Meta criada com sucesso'
        });
      }

      setShowForm(false);
      resetForm();
      loadMetas();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar meta');
      showToast({
        type: 'error',
        title: 'Erro ao salvar meta',
        message: error.response?.data?.error || 'Ocorreu um erro inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAporteModal.meta || !valorAporte) {
      setError('Preencha o valor do aporte');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/metas/${showAporteModal.meta.id}/aportes`, {
        valor: parseFloat(valorAporte),
        descricao: descricaoAporte,
        data: new Date().toISOString().split('T')[0]
      });

      showToast({
        type: 'success',
        title: 'Aporte realizado!',
        message: `Aporte de ${formatCurrency(parseFloat(valorAporte))} realizado com sucesso`
      });

      setShowAporteModal({ open: false, meta: null });
      setValorAporte('');
      setDescricaoAporte('');
      loadMetas();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao realizar aporte');
      showToast({
        type: 'error',
        title: 'Erro ao realizar aporte',
        message: error.response?.data?.error || 'Ocorreu um erro inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meta: Meta) => {
    setEditId(meta.id);
    setCategoria(meta.categoria);
    setValorLimite(String(meta.valor_limite));
    setDescricao(meta.descricao || '');
    setDataInicio(meta.data_inicio ? meta.data_inicio.split('T')[0] : '');
    setDataFim(meta.data_fim ? meta.data_fim.split('T')[0] : '');
    setCor(meta.cor || '#147361');
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta meta?')) {
      return;
    }

    try {
      await api.delete(`/metas/${id}`);
      loadMetas();
      showToast({
        type: 'success',
        title: 'Meta excluída!',
        message: 'Meta excluída com sucesso'
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao excluir meta',
        message: error.response?.data?.error || 'Ocorreu um erro inesperado'
      });
    }
  };

  const resetForm = () => {
    setEditId(null);
    setCategoria('');
    setValorLimite('');
    setDescricao('');
    setDataInicio('');
    setDataFim('');
    setCor('#147361');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getProgressColor = (percentual: number) => {
    if (percentual >= 100) return 'bg-red-500';
    if (percentual >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (percentual: number) => {
    if (percentual >= 100) return 'bg-red-100';
    if (percentual >= 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const totalLimite = metas.reduce((acc, meta) => acc + meta.valor_limite, 0);
  const totalGasto = metas.reduce((acc, meta) => acc + meta.valor_gasto, 0);
  const totalPoupado = metas.reduce((acc, meta) => acc + (meta.valor_poupado || 0), 0);
  const percentualGeral = totalLimite > 0 ? (totalGasto / totalLimite) * 100 : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Metas de Gastos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 transform hover:scale-105 shadow-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus size={20} />
          Nova Meta
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Mês</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="border border-neutral-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          >
            {meses.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ano</label>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="border border-neutral-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          >
            {[ano - 1, ano, ano + 1].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-medium border border-neutral-200/50 hover:shadow-strong transition-all duration-300">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Target className="text-primary-600" size={20} />
            Total das Metas
          </h3>
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(totalLimite)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-medium border border-neutral-200/50 hover:shadow-strong transition-all duration-300">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="text-accent-600" size={20} />
            Total Gasto
          </h3>
          <p className="text-2xl font-bold text-accent-600">
            {formatCurrency(totalGasto)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-medium border border-neutral-200/50 hover:shadow-strong transition-all duration-300">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <PiggyBank className="text-green-600" size={20} />
            Total Poupado
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalPoupado)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-medium border border-neutral-200/50 hover:shadow-strong transition-all duration-300">
          <h3 className="text-lg font-semibold mb-2">Percentual Geral</h3>
          <p className={`text-2xl font-bold ${
            percentualGeral >= 100 ? 'text-accent-600' : 
            percentualGeral >= 80 ? 'text-yellow-600' : 'text-primary-600'
          }`}>
            {percentualGeral.toFixed(1)}%
          </p>
          <div className={`w-full rounded-full h-2 mt-2 ${getProgressBgColor(percentualGeral)}`}>
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentualGeral)}`}
              style={{ width: `${Math.min(percentualGeral, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editId ? 'Editar Meta' : 'Nova Meta'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  required
                  disabled={editId !== null}
                >
                  <option value="">Selecione...</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Limite
                </label>
                <input
                  type="number"
                  value={valorLimite}
                  onChange={(e) => setValorLimite(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 1000.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor da Meta
                </label>
                <div className="flex gap-2">
                  {coresDisponiveis.map(corDisponivel => (
                    <button
                      key={corDisponivel}
                      type="button"
                      onClick={() => setCor(corDisponivel)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        cor === corDisponivel ? 'border-gray-800 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: corDisponivel }}
                      title={`Selecionar cor ${corDisponivel}`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fim
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  min={dataInicio}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                rows={3}
                placeholder="Descreva sua meta..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 transform hover:scale-105 shadow-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Salvando...' : editId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Metas */}
      <div className="space-y-4">
        {metas.map(meta => {
          const percentual = meta.valor_limite > 0 ? (meta.valor_gasto / meta.valor_limite) * 100 : 0;
          const metaAportes = aportes[meta.id] || [];
          const totalAportes = metaAportes.reduce((acc, aporte) => acc + aporte.valor, 0);
          
          return (
            <div 
              key={meta.id} 
              className="bg-white rounded-2xl shadow-medium border border-neutral-200/50 p-6 hover:shadow-strong transition-all duration-300 transform hover:scale-[1.01]"
              style={{ borderLeftColor: meta.cor || '#147361', borderLeftWidth: '4px' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{meta.categoria}</h3>
                  {meta.descricao && (
                    <p className="text-sm text-neutral-600 mt-1">{meta.descricao}</p>
                  )}
                  <p className="text-sm text-neutral-500">
                    {formatCurrency(meta.valor_gasto)} de {formatCurrency(meta.valor_limite)}
                  </p>
                  {meta.data_inicio && meta.data_fim && (
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      {new Date(meta.data_inicio).toLocaleDateString('pt-BR')} - {new Date(meta.data_fim).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  {totalAportes > 0 && (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <PiggyBank size={12} />
                      {formatCurrency(totalAportes)} poupado
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAporteModal({ open: true, meta })}
                    className="p-2 text-neutral-400 hover:text-green-500 rounded-full hover:bg-green-50 transition-all duration-200 transform hover:scale-110"
                    title="Fazer aporte"
                  >
                    <PiggyBank size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(meta)}
                    className="p-2 text-neutral-400 hover:text-primary-500 rounded-full hover:bg-primary-50 transition-all duration-200 transform hover:scale-110"
                    title="Editar meta"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(meta.id)}
                    className="p-2 text-neutral-400 hover:text-accent-500 rounded-full hover:bg-accent-50 transition-all duration-200 transform hover:scale-110"
                    title="Excluir meta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className={`w-full rounded-full h-3 mb-2 ${getProgressBgColor(percentual)}`}>
                <div 
                  className="h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(percentual, 100)}%`,
                    backgroundColor: meta.cor || '#147361'
                  }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">
                  {percentual.toFixed(1)}% utilizado
                </span>
                {percentual >= 90 && (
                  <span className="text-sm text-accent-600 font-medium flex items-center gap-1 animate-pulse">
                    <AlertCircle size={16} />
                    {percentual >= 100 ? 'Meta excedida!' : 'Meta quase atingida!'}
                  </span>
                )}
              </div>
              
              {/* Aportes recentes */}
              {metaAportes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">Aportes Recentes</h4>
                  <div className="space-y-1">
                    {metaAportes.slice(0, 3).map(aporte => (
                      <div key={aporte.id} className="flex justify-between items-center text-xs">
                        <span className="text-neutral-600">
                          {new Date(aporte.data).toLocaleDateString('pt-BR')}
                          {aporte.descricao && ` - ${aporte.descricao}`}
                        </span>
                        <span className="text-green-600 font-medium">
                          {formatCurrency(aporte.valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {metas.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            <Target size={48} className="mx-auto mb-2 opacity-50" />
            <p>Nenhuma meta definida para este período</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 transform hover:scale-105 shadow-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Criar Primeira Meta
            </button>
          </div>
        )}
      </div>
      
      {/* Modal de Aporte */}
      {showAporteModal.open && showAporteModal.meta && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAporteModal({ open: false, meta: null })}
            >
              <XCircle size={24} />
            </button>
            <h2 className="text-xl font-semibold mb-2">Fazer Aporte</h2>
            <div className="mb-4">
              <span className="text-gray-600">Meta: </span>
              <span className="font-medium">{showAporteModal.meta.categoria}</span>
              <div className="mt-2 text-sm text-gray-500">
                Limite: {formatCurrency(showAporteModal.meta.valor_limite)} | 
                Gasto: {formatCurrency(showAporteModal.meta.valor_gasto)}
              </div>
            </div>
            <form onSubmit={handleAporte} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor do Aporte</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={valorAporte}
                  onChange={(e) => setValorAporte(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="0,00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  value={descricaoAporte}
                  onChange={(e) => setDescricaoAporte(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="Ex: Economia do mês"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  loading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Realizando Aporte...' : 'Confirmar Aporte'}
              </button>
            </form>
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Metas;