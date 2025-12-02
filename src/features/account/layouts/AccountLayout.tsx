import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { User, CreditCard, Settings } from 'lucide-react';

export const AccountLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { label: 'Minha Conta', path: '/account/profile', icon: User },
    { label: 'Financeiro', path: '/account/finance', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Settings className='w-8 text-slate-800' />
          <h1 className="text-2xl font-bold text-slate-800">Configurações da Conta</h1>
        </div>
        <p className="text-slate-500 text-sm">Gerencie seus dados pessoais e informações de pagamento.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100">
          <nav className="flex gap-1 p-2" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = currentPath === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                  `}
                >
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
