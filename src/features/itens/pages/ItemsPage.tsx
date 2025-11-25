import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, Package } from 'lucide-react';

export const ItemsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
          <p className="text-slate-500 text-sm">Gerencie seu catálogo de produtos e níveis de estoque.</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all">
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, SKU ou categoria..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">
              Exportar
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-center">Estoque</th>
                <th className="px-6 py-4 text-right">Preço</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <tr key={item} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {item % 2 === 0 ? (
                          <img src={`https://picsum.photos/seed/${item}/100`} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Produto Exemplo {item}</div>
                        <div className="text-xs text-slate-400">SKU-2938{item}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      Eletrônicos
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-medium ${item === 3 ? 'text-red-600' : 'text-slate-700'}`}>
                      {item === 3 ? '2' : '45'}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">un</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700">
                    R$ 299,90
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item === 3 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Crítico
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Ativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Mostrando <span className="font-medium text-slate-900">1</span> a <span className="font-medium text-slate-900">6</span> de <span className="font-medium text-slate-900">24</span> resultados
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 disabled:opacity-50 hover:bg-slate-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};