import React, { useState } from 'react';
import { TrendingUp, Package, AlertCircle, DollarSign, Activity, ChevronDown, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocketDashboard } from '../../../hooks/useWebSocketDashboard';
import { DashboardSkeletons } from '../components/DashboardSkeletons';
import { MovementFlowChart } from '../components/MovementFlowChart';
import { TopMovedItemsCard } from '../components/TopMovedItemsCard';
import { Button } from '@/components/ui';

type Period = '7d' | '30d' | '1m';

export const DashboardPage: React.FC = () => {
  const { account } = useAuth();
  const accountId = account?.id || '';

  const periods = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '1m', label: 'Este mês' },
  ];

  const [period, setPeriod] = useState(periods[0]);

  const { data, loading, error, connected } = useWebSocketDashboard(accountId);

  // Show skeleton while loading
  if (loading || !data) {
    return (
      <div className="space-y-6">
        <DashboardSkeletons />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar dashboard</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handlePeriodChange = (p: Period) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const newPeriod = periods.find((period) => period.value === p);
    if (newPeriod) {
      setPeriod(newPeriod);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            Bem-vindo ao Quobo, aqui está o resumo do seu negócio hoje.
            {connected && (
              <span className="flex items-center gap-1 text-green-600 text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Conectado
              </span>
            )}
          </p>
        </div>
        <div className="dropdown dropdown-start md:dropdown-end">
          <Button
            tabIndex={0}
            variant="ghost"
            size="sm"
            icon={<Filter className="w-4 h-4" />}
          >
            <span className="text-slate-600">
              {period.label}
            </span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-white rounded-box w-52 z-50"
          >
            {periods.map((p) => (
              <li key={p.value}>
                <a onClick={() => handlePeriodChange(p.value as Period)}>
                  {p.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Value Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Valor em Estoque</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {formatCurrency(data.totalStockValue || 0)}
              </h3>
              <div className="flex items-center mt-2 text-slate-400 text-xs font-medium">
                <span>Produtos em estoque</span>
              </div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Total de Produtos</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {data.totalProducts?.toLocaleString('pt-BR') || 0}
              </h3>
              {data.productsGrowth !== undefined && (
                <div className={`flex items-center mt-2 text-xs font-medium ${data.productsGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                  <TrendingUp className={`w-3 h-3 mr-1 ${data.productsGrowth < 0 ? 'rotate-180' : ''}`} />
                  <span>{data.productsGrowth >= 0 ? '+' : ''}{data.productsGrowth}% vs mês anterior</span>
                </div>
              )}
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Estoque Baixo</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.lowStock || 0}</h3>
              <div className={`flex items-center mt-2 text-xs font-medium ${data.lowStock > 0 ? 'text-red-500' : 'text-slate-400'
                }`}>
                {data.lowStock > 0 && <AlertCircle className="w-3 h-3 mr-1" />}
                <span>{data.lowStockStatus || 'Estoque adequado'}</span>
              </div>
            </div>
            <div className={`p-2 rounded-lg ${data.lowStock > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
              <Activity className={`w-6 h-6 ${data.lowStock > 0 ? 'text-red-600' : 'text-slate-400'}`} />
            </div>
          </div>
        </div>

        {/* 7-day Movements Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Movimentações (7d)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {data.sevenDayMovements?.toLocaleString('pt-BR') || 0}
              </h3>
              <div className="flex items-center mt-2 text-slate-500 text-xs font-medium">
                <span>Últimos 7 dias</span>
              </div>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section */}
        <div className="lg:col-span-2">
          <MovementFlowChart data={data.weeklyMovement || []} />
        </div>

        {/* Side Lists */}
        <TopMovedItemsCard items={data.topMovedItems || []} />
      </div>
    </div>
  );
};
