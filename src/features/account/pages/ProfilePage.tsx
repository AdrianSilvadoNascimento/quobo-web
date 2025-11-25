import React from 'react';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <div className="relative group cursor-pointer">
          <img
            src={user?.avatar || "https://picsum.photos/100/100"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
          <p className="text-slate-500 text-sm">Administrador</p>
          <button className="text-brand-600 text-xs font-semibold hover:underline mt-1">Alterar foto</button>
        </div>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="floating-label">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Nome Completo
              </span>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <label className='floating-label'>
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Email
              </span>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <label className="floating-label">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Telefone
              </span>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <label className="floating-label">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Localização
              </span>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cidade, Estado"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button className="btn btn-primary hover:bg-brand-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all">
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};
