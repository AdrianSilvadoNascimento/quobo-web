import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Settings, ArrowRightLeft, ShoppingCart } from 'lucide-react';

interface MovementStatistics {
  total: number;
  entries: number;
  outputs: number;
  adjusts: number;
  transfers: number;
  sales: number;
  totalValue: number;
}

interface StatisticsChartsProps {
  stats: MovementStatistics;
}

const COLORS = {
  ENTRY: '#10B981',     // green
  OUT: '#EF4444',       // red
  ADJUST: '#3B82F6',    // blue
  TRANSFER: '#8B5CF6',  // purple
  SALE: '#F59E0B',      // amber
};

const ICONS = {
  ENTRY: TrendingUp,
  OUT: TrendingDown,
  ADJUST: Settings,
  TRANSFER: ArrowRightLeft,
  SALE: ShoppingCart,
};

export const StatisticsCharts: React.FC<StatisticsChartsProps> = ({ stats }) => {
  const pieData = [
    { name: 'Entradas', value: stats.entries, color: COLORS.ENTRY, Icon: ICONS.ENTRY },
    { name: 'Saídas', value: stats.outputs, color: COLORS.OUT, Icon: ICONS.OUT },
    { name: 'Ajustes', value: stats.adjusts, color: COLORS.ADJUST, Icon: ICONS.ADJUST },
    { name: 'Transferências', value: stats.transfers, color: COLORS.TRANSFER, Icon: ICONS.TRANSFER },
    { name: 'Vendas', value: stats.sales, color: COLORS.SALE, Icon: ICONS.SALE },
  ].filter(item => item.value > 0);

  if (stats.total === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Nenhuma movimentação no período selecionado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cards de Estatísticas */}
      <div className="space-y-3">
        {pieData.map((item) => {
          const Icon = item.Icon;
          const percentage = ((item.value / stats.total) * 100).toFixed(1);
          return (
            <div
              key={item.name}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.name}</p>
                  <p className="text-xs text-slate-500">{percentage}% do total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-800">{item.value}</p>
              </div>
            </div>
          );
        })}

        {/* Total Value */}
        {stats.totalValue > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="text-sm font-medium text-blue-700">Valor Total</p>
              <p className="text-xs text-blue-600">Movimentações com valor</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-800">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stats.totalValue)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico de Pizza */}
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                      <p className="font-semibold text-slate-800">{data.name}</p>
                      <p className="text-sm text-slate-600">Quantidade: {data.value}</p>
                      <p className="text-sm text-slate-600">
                        Percentual: {((data.value as number / stats.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
