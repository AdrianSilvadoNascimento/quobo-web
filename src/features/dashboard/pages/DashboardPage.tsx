import React from 'react';
import { TrendingUp, Package, AlertCircle, DollarSign, Activity } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
          <p className="text-slate-500 text-sm">Bem-vindo ao Quobo, aqui está o resumo do seu negócio hoje.</p>
        </div>
        <select className="w-40 select select-secondary">
          <option>Últimos 7 dias</option>
          <option>Últimos 30 dias</option>
          <option>Este mês</option>
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Valor em Estoque</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">R$ 45.231,89</h3>
              <div className="flex items-center mt-2 text-green-500 text-xs font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+12% vs mês anterior</span>
              </div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Total de Produtos</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">1,240</h3>
              <div className="flex items-center mt-2 text-slate-400 text-xs font-medium">
                <span>45 novas adições</span>
              </div>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Estoque Baixo</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">12</h3>
              <div className="flex items-center mt-2 text-red-500 text-xs font-medium">
                <AlertCircle className="w-3 h-3 mr-1" />
                <span>Requer atenção</span>
              </div>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Movimentações</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">89</h3>
              <div className="flex items-center mt-2 text-slate-500 text-xs font-medium">
                <span>Hoje</span>
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
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Fluxo de Movimentação</h3>
          {/* Mock Chart Visual */}
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 65, 30, 80, 55, 90, 45, 60, 75, 50, 85, 95].map((height, i) => (
              <div key={i} className="w-full bg-brand-50 hover:bg-brand-100 rounded-t-sm relative group transition-all">
                <div
                  className="absolute bottom-0 w-full bg-brand-500 rounded-t-sm transition-all duration-500 group-hover:bg-brand-600"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                  {height * 10} un
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-400">
            <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
            <span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
          </div>
        </div>

        {/* Side Lists */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Itens Mais Movimentados</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-700">Produto Exemplo {item}</h4>
                  <p className="text-xs text-slate-400">SKU-8923{item}</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-brand-600">{120 - item * 10}</span>
                  <span className="text-[10px] text-slate-400 uppercase">saídas</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-brand-600 font-medium hover:bg-brand-50 rounded-lg transition-colors">
            Ver relatório completo
          </button>
        </div>
      </div>
    </div>
  );
};
