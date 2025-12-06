import React, { useState, useEffect } from 'react';
import { useLocation, Outlet, useNavigate, Link } from 'react-router-dom';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { useAuth } from '../contexts/AuthContext';
import { ExpiredSubscriptionModal } from '../components/ExpiredSubscriptionModal';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Users,
  LogOut,
  Bell,
  Menu as MenuIcon,
  Tag,
  ChevronDown,
  CreditCard,
  Settings,
  User,
  ClipboardCheck,
} from 'lucide-react';

import QuoboIcon from '@/assets/quobo-icon.svg';

import { useSubscriptionSocket } from '../hooks/useSubscriptionSocket';

export const DashboardLayout: React.FC = () => {
  const { logout, user, account, expirationDays, isTrial, subscription, isSubscriptionExpired, updateSubscriptionStatus } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Real-time subscription updates
  const { lastUpdate } = useSubscriptionSocket(account?.id);

  useEffect(() => {
    if (lastUpdate) {
      updateSubscriptionStatus();
    }
  }, [lastUpdate, updateSubscriptionStatus]);

  const navItems = [
    { label: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Produtos', icon: Package, path: '/products' },
    { label: 'Movimentações', icon: ArrowLeftRight, path: '/movements' },
    { label: 'Categorias', icon: Tag, path: '/categories' },
    { label: 'Clientes', icon: Users, path: '/customers' },
    { label: 'Auditorias', icon: ClipboardCheck, path: '/audits' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (isSubscriptionExpired && location.pathname !== '/checkout') {
      navigate('/checkout', { replace: true });
    }
  }, [isSubscriptionExpired, location.pathname, navigate]);

  useEffect(() => {
    if (isSubscriptionExpired) {
      setCollapsed(true);
      setToggled(false);
    }
  }, [isSubscriptionExpired]);

  const handleModalDismiss = () => {
    setModalDismissed(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        breakPoint="lg"
        backgroundColor="#ffffff"
        rootStyles={{
          border: 'none',
          borderRight: '1px solid rgb(226, 232, 240)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-16 border-b border-slate-100 px-6">
            <div className="flex items-center gap-2 font-bold text-2xl text-brand-700">
              <div className="flex items-center justify-center border-2 border-white shadow-md w-12 h-12 rounded-full bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF]">
                <img src={QuoboIcon} alt="Quobo Logo" className="w-10 h-auto" />
              </div>
              {!collapsed && <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF]">Quobo</span>}
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-6">
            {!collapsed && (
              <div className="px-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Menu Principal
              </div>
            )}
            <Menu
              menuItemStyles={{
                button: ({ active }) => ({
                  backgroundColor: active ? 'rgb(240, 249, 255)' : 'transparent',
                  color: active ? 'rgb(3, 105, 161)' : 'rgb(71, 85, 105)',
                  fontWeight: active ? '600' : '500',
                  fontSize: '0.875rem',
                  padding: '10px 20px',
                  margin: '4px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: active ? 'rgb(240, 249, 255)' : 'rgb(248, 250, 252)',
                    color: active ? 'rgb(3, 105, 161)' : 'rgb(15, 23, 42)',
                  },
                }),
              }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.path}
                  active={isActive(item.path)}
                  icon={
                    <item.icon
                      className={`w-5 h-5 ${isActive(item.path) ? 'text-brand-600' : 'text-slate-400'}
                        }`}
                    />
                  }
                  onClick={() => {
                    navigate(item.path);
                    setToggled(false);
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-100">
            <Menu
              menuItemStyles={{
                button: {
                  color: 'rgb(71, 85, 105)',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgb(254, 242, 242)',
                    color: 'rgb(220, 38, 38)',
                  },
                },
              }}
            >
              <MenuItem
                icon={<LogOut className="w-5 h-5" />}
                onClick={logout}
              >
                Sair da conta
              </MenuItem>
            </Menu>
          </div>
        </div>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 w-full bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          {!isSubscriptionExpired ? (
            <>
              <button
                className="p-2 -ml-2 rounded-md text-slate-600 hover:bg-slate-100 transition-all duration-300 ease-in-out lg:hidden"
                onClick={() => setToggled(!toggled)}
              >
                <MenuIcon className="w-6 h-6" />
              </button>
              <button
                className="p-2 -ml-2 rounded-md text-slate-600 hover:bg-slate-100 transition-all duration-300 ease-in-out hidden lg:block"
                onClick={() => setCollapsed(!collapsed)}
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            </>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-4">
            {isTrial && (
              <>
                <div className="text-xs text-slate-500 hidden sm:block text-right">
                  <p>
                    Plano <span className="font-semibold text-primary">
                      {subscription?.plan?.name}
                    </span>
                  </p>
                  {expirationDays !== null && expirationDays > 0 && (
                    <p>Expira em {expirationDays} {expirationDays === 1 ? 'dia' : 'dias'}</p>
                  )}
                  {expirationDays !== null && expirationDays <= 0 && (
                    <p className="text-red-500 font-semibold">Expirado</p>
                  )}
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="btn btn-primary btn-sm bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] opacity-80 text-white text-xs font-bold rounded-full transition-all animate-pulse hover:animate-none hover:opacity-100 hidden sm:block">
                  Contratar Plano
                </button>
              </>
            )}

            {!isTrial && subscription?.canceled_at && !isSubscriptionExpired && (
              <>
                <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium border border-red-100 hidden sm:block">
                  Agendado para cancelamento em {new Date(subscription.next_renewal).toLocaleDateString()}
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="btn btn-primary btn-sm bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] text-white text-xs font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-blue-500/30 hidden sm:block">
                  Contratar Plano
                </button>
              </>
            )}

            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* User Dropdown - DaisyUI */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-2 ml-2 hover:bg-slate-50 p-1 rounded-lg transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
              >
                {user?.avatar ? (
                  <div className="avatar">
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="w-9 rounded-full border-2 border-white shadow-md"
                    />
                  </div>
                ) : (
                  <div className="avatar">
                    <div className="bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] w-9 flex items-center justify-center rounded-full border-2 border-white shadow-md">
                      <span className="text-xs font-bold text-white">{user?.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  </div>
                )}
                <div className="hidden lg:block text-sm text-left">
                  <p className="font-medium text-slate-700 leading-tight">{user?.name}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Dropdown Content */}
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-white rounded-xl shadow-lg border border-slate-100 w-52 p-0 mt-3 z-50"
              >
                {/* User Info Header */}
                <li className="menu-title px-4 py-3 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate font-normal">{user?.email}</p>
                  </div>
                </li>

                {/* Menu Items */}
                <li>
                  <Link to="/account/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600">
                    <User className="w-4 h-4" />
                    Minha Conta
                  </Link>
                </li>
                <li>
                  <Link to="/account/finance" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600">
                    <CreditCard className="w-4 h-4" />
                    Financeiro
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600">
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Link>
                </li>

                {/* Logout - Separated */}
                <li className="border-t border-slate-50">
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </li>
              </ul>
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

      {/* Expired Subscription Modal - shows until user clicks choose plan */}
      {isSubscriptionExpired && !modalDismissed && <ExpiredSubscriptionModal isTrial={isTrial} onChoosePlan={handleModalDismiss} />}
    </div>
  );
};
