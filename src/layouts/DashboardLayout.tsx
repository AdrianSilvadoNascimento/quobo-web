import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Box
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Produtos', icon: Package, path: '/products' },
    { label: 'Movimentações', icon: ArrowLeftRight, path: '/movements' },
    { label: 'Clientes', icon: Users, path: '/customers' },
    { label: 'Assinatura', icon: CreditCard, path: '/subscription' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-sm transform transition-transform duration-300 ease-in-out
          lg:static lg:transform-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-slate-100 px-6">
            <div className="flex items-center gap-2 font-bold text-2xl text-brand-700">
              <Box className="w-8 h-8 fill-brand-600 text-white p-1 rounded-lg" />
              <span>Quobo</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Menu Principal
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.path)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-brand-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair da conta
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <button
            className="p-2 -ml-2 rounded-md lg:hidden text-slate-600 hover:bg-slate-100"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Busque por produtos, movimentos ou configurações..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500 hidden sm:block text-right">
              <p>Plano <span className="font-semibold text-brand-600">Free</span></p>
              <p>Expira em 2 dias</p>
            </div>
            <button className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 px-4 rounded-full transition-colors hidden sm:block shadow-sm">
              Fazer Upgrade
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="flex items-center gap-2 ml-2">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm object-cover"
                />
              )}
              <div className="hidden lg:block text-sm">
                <p className="font-medium text-slate-700">{user?.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
