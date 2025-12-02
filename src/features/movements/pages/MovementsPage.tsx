import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Download, Calendar } from 'lucide-react';

export const MovementsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Movimentações</h1>
          <p className="text-slate-500 text-sm">Histórico completo de entradas, saídas e transferências.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Relatório PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center overflow-x-auto pb-2 sm:pb-0">
            <span className="text-sm font-medium text-slate-700 mr-2">Filtrar por:</span>
            <button className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100">Todos</button>
            <button className="px-3 py-1.5 rounded-full bg-white text-slate-600 text-xs font-semibold border border-slate-200 hover:bg-slate-50">Entradas</button>
            <button className="px-3 py-1.5 rounded-full bg-white text-slate-600 text-xs font-semibold border border-slate-200 hover:bg-slate-50">Saídas</button>
            <button className="px-3 py-1.5 rounded-full bg-white text-slate-600 text-xs font-semibold border border-slate-200 hover:bg-slate-50">Transferências</button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4">Origem / Destino</th>
                <th className="px-6 py-4 text-right">Quantidade</th>
                <th className="px-6 py-4 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { type: 'in', label: 'Entrada', color: 'text-green-600', bg: 'bg-green-50', icon: ArrowDownLeft, qty: '+50' },
                { type: 'out', label: 'Saída', color: 'text-red-600', bg: 'bg-red-50', icon: ArrowUpRight, qty: '-12' },
                { type: 'transfer', label: 'Transferência', color: 'text-blue-600', bg: 'bg-blue-50', icon: ArrowLeftRight, qty: '30' },
                { type: 'out', label: 'Saída', color: 'text-red-600', bg: 'bg-red-50', icon: ArrowUpRight, qty: '-5' },
                { type: 'in', label: 'Entrada', color: 'text-green-600', bg: 'bg-green-50', icon: ArrowDownLeft, qty: '+100' },
              ].map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.bg} ${item.color}`}>
                      <item.icon className="w-3 h-3" />
                      {item.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">Produto Exemplo {index + 1}</div>
                    <div className="text-xs text-slate-400">Ref: 2023-00{index}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">AS</div>
                      <span>Adrian Silva</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {item.type === 'transfer' ? 'Depósito A → Loja 1' : (item.type === 'in' ? 'Fornecedor ABC' : 'Venda Balcão')}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${item.color}`}>
                    {item.qty}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    24 Out, 14:30
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
