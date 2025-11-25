import React from 'react';
import { UserPlus, Search, Mail, Phone, MapPin, MoreVertical } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-500 text-sm">Gerencie sua base de clientes e parceiros.</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all">
          <UserPlus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar cliente por nome, email ou documento..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-50 rounded-full flex items-center justify-center text-brand-700 font-bold text-lg border border-brand-100">
                  {String.fromCharCode(64 + i)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Cliente Exemplo {i}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">Ativo</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>cliente{i}@email.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>(11) 99999-999{i}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>São Paulo, SP</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400">Cadastrado em 20/10/2023</span>
              <button className="text-brand-600 font-medium hover:underline">Ver detalhes</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
