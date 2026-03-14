import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Scale, Webhook, KeyRound, Settings2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const SettingsLayout: React.FC = () => {
  const { subscription } = useAuth();

  const planFeatures = subscription?.plan?.features as any;
  const hasApiAccess = planFeatures?.api_access?.enabled;

  const getLinkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
    ${isActive
      ? 'bg-[#2563EB] text-white shadow-md'
      : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'}
  `;

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-8rem)]">
      {/* Floating Sidebar */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="sticky top-8 space-y-8">
          <div className="px-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-lg shadow-sm">
                <Settings2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Configurações</h1>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Personalize a plataforma inteiramente para o seu fluxo de negócio.
            </p>
          </div>

          <nav className="flex flex-col gap-1 p-2 bg-slate-50/50 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <NavLink to="/settings/unit-of-measure" className={getLinkClass}>
              <Scale className="w-5 h-5" />
              Unidade de Medida
            </NavLink>

            {hasApiAccess && (
              <>
                <NavLink to="/settings/integrations" className={getLinkClass}>
                  <KeyRound className="w-5 h-5" />
                  Tokens de API
                </NavLink>
                <NavLink to="/settings/webhooks" className={getLinkClass}>
                  <Webhook className="w-5 h-5" />
                  Webhooks
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white/40 backdrop-blur-md rounded-3xl border border-white p-6 shadow-sm overflow-hidden min-h-[500px]">
        <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
