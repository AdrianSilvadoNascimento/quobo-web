import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Loader2, ChevronDown } from 'lucide-react';
import { StatisticsCharts } from '../components/StatisticsCharts';
import { TopItemsChart } from '../components/TopItemsChart';
import { movement_service } from '../services/movement.service';

export const MovementsAnalyticsTab: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const { from, to } = getPeriodDates();

      const [statsData, topItemsData] = await Promise.all([
        movement_service.getStatistics(from, to),
        movement_service.getTopMovedItems(10, from, to),
      ]);

      setStats(statsData);
      setTopItems(topItemsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPeriodDates = () => {
    const today = new Date();
    let from: string | undefined;
    const to = today.toISOString().split('T')[0];

    switch (period) {
      case '7d':
        from = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        break;
      case '30d':
        from = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
        break;
      case '90d':
        from = new Date(today.setDate(today.getDate() - 90)).toISOString().split('T')[0];
        break;
      case 'all':
        from = undefined;
        break;
    }

    return { from, to };
  };

  const periodLabels = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
    'all': 'Todo período',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">Análise de Movimentações</h2>
        </div>

        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-slate-600">
              {periodLabels[period]}
            </span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-white rounded-box w-52 z-50"
          >
            {Object.entries(periodLabels).map(([value, label]) => (
              <li key={value}>
                <a
                  onClick={() => {
                    setPeriod(value as any);
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                  }}
                  className={period === value ? 'active' : ''}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Total Movementations Card */}
      {stats && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total de Movimentações</p>
              <p className="text-4xl font-bold mt-1">{stats.total}</p>
              <p className="text-blue-100 text-sm mt-2">
                {periodLabels[period]}
              </p>
            </div>
            <BarChart3 className="w-16 h-16 text-blue-300 opacity-50" />
          </div>
        </div>
      )}

      {/* Statistics Charts */}
      {stats && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-md font-semibold text-slate-800 mb-4">
            Distribuição por Tipo
          </h3>
          <StatisticsCharts stats={stats} />
        </div>
      )}

      {/* Top Moved Items Chart */}
      {topItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-md font-semibold text-slate-800 mb-4">
            Produtos Mais Movimentados
          </h3>
          <TopItemsChart data={topItems} />
        </div>
      )}

      {/* Empty State */}
      {stats && stats.total === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">Nenhuma movimentação encontrada</p>
          <p className="text-slate-400 text-sm mt-2">
            Tente selecionar um período diferente
          </p>
        </div>
      )}
    </div>
  );
};
