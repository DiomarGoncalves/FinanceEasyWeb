import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Formatação do mês atual para exibição
  const formattedMonth = format(currentMonth, 'MMMM yyyy', { locale: ptBR });
  const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

  // Dados para o gráfico de linha
  const balanceData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Receitas',
        data: [4200, 4500, 5100, 5700, 5200, 5300, 5600, 5800, 6100, 5900, 6200, 6500],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Despesas',
        data: [3800, 4100, 4300, 4500, 3840, 4100, 4300, 4200, 4600, 4500, 4800, 5100],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Opções para o gráfico de linha
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return `R$ ${value.toLocaleString('pt-BR')}`;
          },
        },
      },
    },
  };

  // Dados para o gráfico de rosca
  const expensesByCategoryData = {
    labels: ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Outros'],
    datasets: [
      {
        data: [1200, 850, 600, 450, 400, 340],
        backgroundColor: [
          '#6366F1', // Indigo
          '#F59E0B', // Amber
          '#10B981', // Emerald
          '#EC4899', // Pink
          '#8B5CF6', // Violet
          '#94A3B8', // Slate
        ],
        borderWidth: 1,
      },
    ],
  };

  // Lista de próximas faturas
  const upcomingInvoices = [
    { card: 'Nubank', date: '15/06/2025', amount: 1845.67, status: 'pending' },
    { card: 'Itaú', date: '10/06/2025', amount: 1250.00, status: 'pending' },
    { card: 'Santander', date: '05/06/2025', amount: 560.90, status: 'due_soon' },
  ];

  // Lista de alertas
  const alerts = [
    { 
      type: 'limit', 
      message: 'Cartão Nubank próximo do limite (85%)',
      icon: <CreditCard size={16} className="text-limit" />
    },
    { 
      type: 'invoice', 
      message: 'Fatura do Santander vence em 2 dias',
      icon: <AlertCircle size={16} className="text-pending" />
    },
    { 
      type: 'expense', 
      message: 'Gastos com Alimentação acima do orçamento',
      icon: <ArrowUpCircle size={16} className="text-expense" />
    },
  ];

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-slate-500">Resumo financeiro de {capitalizedMonth}</p>
      </header>

      {/* Cartões de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Receitas do mês</h3>
          <div className="flex items-center">
            <div className="mr-3 bg-green-100 rounded-full p-2">
              <ArrowDownCircle size={24} className="text-income" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-income">R$ 5.200,00</p>
              <p className="text-xs text-slate-500">+12% comparado ao mês anterior</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Despesas do mês</h3>
          <div className="flex items-center">
            <div className="mr-3 bg-red-100 rounded-full p-2">
              <ArrowUpCircle size={24} className="text-expense" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-expense">R$ 3.840,00</p>
              <p className="text-xs text-slate-500">-5% comparado ao mês anterior</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Saldo</h3>
          <div className="flex items-center">
            <div className="mr-3 bg-blue-100 rounded-full p-2">
              <CreditCard size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-blue-600">R$ 1.360,00</p>
              <p className="text-xs text-slate-500">26% da receita total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e informações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico de linha - Receitas x Despesas */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Receitas x Despesas (2025)</h3>
          <div className="h-64">
            <Line data={balanceData} options={lineOptions} />
          </div>
        </div>

        {/* Gráfico de rosca - Despesas por categoria */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Despesas por categoria</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={expensesByCategoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Próximas faturas e alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas faturas */}
        <div className="card">
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-medium">Próximas faturas</h3>
          </div>
          <div className="p-0">
            {upcomingInvoices.map((invoice, index) => (
              <div key={index} className={`p-4 flex items-center justify-between ${
                index !== upcomingInvoices.length - 1 ? 'border-b border-slate-100' : ''
              }`}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    invoice.status === 'due_soon' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.card}</p>
                    <p className="text-xs text-slate-500">Vence em {invoice.date}</p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  invoice.status === 'due_soon' ? 'text-pending' : 'text-slate-700'
                }`}>
                  R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
          <div className="p-3 text-center border-t border-slate-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Ver todas as faturas
            </button>
          </div>
        </div>

        {/* Alertas */}
        <div className="card">
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-medium">Alertas</h3>
          </div>
          <div className="p-0">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-4 flex items-center ${
                index !== alerts.length - 1 ? 'border-b border-slate-100' : ''
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  alert.type === 'limit' ? 'bg-indigo-100' : 
                  alert.type === 'invoice' ? 'bg-amber-100' : 'bg-red-100'
                }`}>
                  {alert.icon}
                </div>
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-xs text-slate-500">Hoje</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 text-center border-t border-slate-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Configurar alertas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;