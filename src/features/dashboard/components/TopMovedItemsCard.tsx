import React from 'react';
import { Package, TrendingUp, TrendingDown } from 'lucide-react';
import type { TopMovedItem } from '../../../hooks/useWebSocketDashboard';

interface TopMovedItemsCardProps {
  items: TopMovedItem[];
}

export const TopMovedItemsCard: React.FC<TopMovedItemsCardProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Itens Mais Movimentados</h3>
        <div className="py-8 text-center text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum item movimentado nos últimos 7 dias</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 className="font-bold text-slate-800 mb-4">Itens Mais Movimentados</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3">
            {/* Product Image or Icon */}
            <div className="relative">
              {item.product_image ? (
                <img
                  src={item.product_image}
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center ${item.product_image ? 'hidden' : 'flex'
                  }`}
              >
                <Package className="w-5 h-5 text-slate-400" />
              </div>
              {/* Ranking badge */}
              {index < 3 && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-600'
                  }`}>
                  {index + 1}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-700 truncate">{item.name}</h4>
              <p className="text-xs text-slate-400 truncate">
                {item.barcode || 'Sem código'}
              </p>
            </div>

            {/* Movement Stats */}
            <div className="text-right">
              <span className="block text-sm font-bold text-brand-600">
                {item.totalMovements}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <div className="flex items-center gap-0.5 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>{item.movements.entries}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-0.5 text-red-600">
                  <TrendingDown className="w-3 h-3" />
                  <span>{item.movements.exits}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-2 text-sm text-brand-600 font-medium hover:bg-brand-50 rounded-lg transition-colors">
        Ver relatório completo
      </button>
    </div>
  );
};
