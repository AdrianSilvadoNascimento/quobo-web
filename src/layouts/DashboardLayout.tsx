import React, { useState, useEffect } from 'react';
import { useLocation, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ExpiredSubscriptionModal } from '../components/ExpiredSubscriptionModal';
import { SessionExpiryModal } from '@/features/auth/components/SessionExpiryModal';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Users,
  LogOut,
  Tag,
  ChevronDown,
  CreditCard,
  Settings,
  User,
  ClipboardCheck,
  FileSpreadsheet,
  PanelLeftClose,
} from 'lucide-react';

import QuoboIcon from '@/assets/quobo-icon.svg';

import { useSubscriptionSocket } from '../hooks/useSubscriptionSocket';
import { supabase } from '@/config/supabase';
import { useTimer } from '@/hooks/useTimer';

const DRAWER_ID = 'quobo-sidebar-drawer';

export const DashboardLayout: React.FC = () => {
  const {
    logout,
    user,
    account,
    expirationDays,
    isTrial,
    subscription,
    isSubscriptionExpired,
    isSubscriptionSuspended,
    refreshToken,
    isAdmin,
    sessionExpiresAt
  } = useAuth();

  const [modalDismissed, setModalDismissed] = useState(false);
  const [isChangingToken, setIsChangingToken] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Real-time subscription updates
  const { lastUpdate } = useSubscriptionSocket(account?.id);

  useEffect(() => {
    if (lastUpdate) {
      refreshToken();
    }
  }, [lastUpdate, refreshToken]);

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerificationEmail = async () => {
    if (!user?.email || isResending) return;

    try {
      setIsResending(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (error) throw error;
      setResendSuccess(true);

      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to resend verification email', error);
    } finally {
      setIsResending(false);
    }
  };

  const navItems = [
    { label: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Produtos', icon: Package, path: '/products' },
    { label: 'Movimentações', icon: ArrowLeftRight, path: '/movements' },
    { label: 'Categorias', icon: Tag, path: '/categories' },
    { label: 'Clientes', icon: Users, path: '/customers' },
    ...(subscription?.plan?.features?.team_features?.enabled ? [{ label: 'Time', icon: User, path: '/team' }] : []),
    { label: 'Auditorias', icon: ClipboardCheck, path: '/audits' },
    ...(subscription?.plan?.features?.import_features?.excel_import ? [{ label: 'Importação', icon: FileSpreadsheet, path: '/import' }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  // Allowed paths for delinquent users (suspended or expired)
  const delinquentAllowedPaths = ['/checkout', '/account/finance', '/plans'];
  const isOnAllowedPath = delinquentAllowedPaths.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    if (isSubscriptionExpired && !isOnAllowedPath) {
      const redirectPath = isSubscriptionSuspended ? '/account/finance' : '/checkout';
      navigate(redirectPath, { replace: true });
    }
  }, [isSubscriptionExpired, isSubscriptionSuspended, isOnAllowedPath, location.pathname, navigate]);

  const handleModalDismiss = () => {
    setModalDismissed(true);
  };

  // Close mobile drawer when navigating
  const handleNavClick = (path: string) => {
    if (isSubscriptionExpired) return;
    navigate(path);
    // Uncheck the drawer toggle to close it on mobile
    const toggle = document.getElementById(DRAWER_ID) as HTMLInputElement;
    if (toggle) toggle.checked = false;
  };

  // ─── Session Expiry Timer ───

  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const fiveMin = 5 * 60;

  const { start, reset, pause, formatTime } = useTimer({
    initialTime: fiveMin,
    onTimeOver: () => {
      logout();
    }
  });

  useEffect(() => {
    const checkExpiry = () => {
      if (!sessionExpiresAt) return;

      const now = new Date();
      const timeDiff = sessionExpiresAt.getTime() - now.getTime();
      const minutesLeft = timeDiff / (1000 * 60);

      if (minutesLeft <= 5 && minutesLeft > 0) {
        if (!showExpiryModal) {
          setShowExpiryModal(true);
          reset();
          start();
        }
      } else if (minutesLeft <= 0) {
        logout();
      }
    };

    const interval = setInterval(checkExpiry, 30000);
    checkExpiry();

    return () => clearInterval(interval);
  }, [sessionExpiresAt, showExpiryModal, start, reset]);

  const handleContinueSession = async () => {
    try {
      setIsChangingToken(true);
      await refreshToken();
      setShowExpiryModal(false);
      pause();
      reset();
    } catch (e) {
      console.error("Failed to extend session", e);
      logout();
    } finally {
      setIsChangingToken(false);
    }
  };

  return (
    <div className="drawer lg:drawer-open h-screen">
      <input id={DRAWER_ID} type="checkbox" className="drawer-toggle" />

      {/* ═══ Main Content (drawer-content) ═══ */}
      <div className="drawer-content flex flex-col h-screen overflow-hidden">
        {/* Verification Banner */}
        {user && !user.email_verified && (
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm transition-all duration-300 gap-2 sm:gap-4">
            <div className="flex items-start sm:items-center gap-2 text-amber-800">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mt-1.5 sm:mt-0 shrink-0"></div>
              <p className="leading-tight">
                <span className="font-semibold">Atenção:</span> Seu email ainda não foi verificado. Por favor, verifique sua caixa de entrada.
              </p>
            </div>

            <button
              onClick={handleResendVerificationEmail}
              disabled={isResending || resendSuccess}
              className={`shrink-0 cursor-pointer font-medium underline transition-colors ml-4 sm:ml-0 ${resendSuccess
                ? 'text-green-600 hover:text-green-700 no-underline cursor-default'
                : 'text-amber-700 hover:text-amber-900 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
            >
              {isResending ? 'Enviando...' : resendSuccess ? 'Email enviado!' : 'Reenviar email'}
            </button>
          </div>
        )}

        {/* Topbar / Navbar */}
        <header className="navbar h-16 w-full bg-white border-b border-slate-200 px-2 lg:px-8 min-h-0 shrink-0">
          <div className="flex-none">
            {/* Toggle button — visible on all screens */}
            <label htmlFor={DRAWER_ID} aria-label="toggle sidebar" className="btn btn-square btn-ghost">
              <PanelLeftClose className="w-5 h-5 text-slate-500" />
            </label>
          </div>

          <div className="flex-1" />

          {/* Right side of topbar */}
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
                  Agendado para cancelamento em {new Date(subscription.next_renewal).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="btn btn-primary btn-sm bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] text-white text-xs font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-blue-500/30 hidden sm:block">
                  Contratar Plano
                </button>
              </>
            )}

            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

            {/* User Dropdown */}
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
                      className="w-9 h-9 rounded-full border-2 border-white shadow-md object-cover"
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
                <li className="menu-title px-4 py-3 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate font-normal">{user?.email}</p>
                  </div>
                </li>

                <li>
                  <Link to="/account/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600">
                    <User className="w-4 h-4" />
                    Minha Conta
                  </Link>
                </li>
                {(isAdmin) && (
                  <li>
                    <Link to="/account/finance" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600">
                      <CreditCard className="w-4 h-4" />
                      Financeiro
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600">
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Link>
                </li>

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
          <div className="mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ═══ Drawer Sidebar ═══ */}
      <div className="drawer-side is-drawer-close:overflow-visible z-40">
        <label htmlFor={DRAWER_ID} aria-label="close sidebar" className="drawer-overlay"></label>

        <div className="flex min-h-full flex-col bg-white border-r border-slate-200 is-drawer-close:w-[4.5rem] is-drawer-open:w-64 transition-all duration-300">
          {/* Logo Section */}
          <div className="flex items-center is-drawer-close:justify-center h-16 border-b border-slate-100 px-4 is-drawer-open:px-6 shrink-0">
            <div className="flex items-center gap-2 font-bold text-2xl text-brand-700 is-drawer-close:gap-0">
              <div className="flex items-center justify-center border-2 border-white shadow-md w-10 h-10 rounded-full bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] shrink-0">
                <img src={QuoboIcon} alt="Quobo Logo" className="w-8 h-auto" />
              </div>
              <span className="is-drawer-close:hidden text-transparent bg-clip-text bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF]">
                Quobo
              </span>
            </div>
          </div>

          {/* Menu Label */}
          <div className="is-drawer-close:hidden px-6 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </div>

          {/* Navigation Items */}
          <ul className="menu w-full grow px-2 gap-0.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right is-drawer-close:justify-center flex items-center gap-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  data-tip={item.label}
                >
                  <item.icon
                    className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-sky-600' : 'text-slate-400'}`}
                  />
                  <span className="is-drawer-close:hidden text-sm">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Logout Button */}
          <div className="border-t border-slate-100 p-2">
            <ul className="menu w-full">
              <li>
                <button
                  onClick={logout}
                  className="is-drawer-close:tooltip is-drawer-close:tooltip-right is-drawer-close:justify-center flex items-center gap-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
                  data-tip="Sair da conta"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span className="is-drawer-close:hidden text-sm font-medium">Sair da conta</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ═══ Modals ═══ */}
      {isSubscriptionExpired && !modalDismissed && (
        <ExpiredSubscriptionModal
          isTrial={isTrial}
          onChoosePlan={handleModalDismiss}
        />
      )}

      <SessionExpiryModal
        isOpen={showExpiryModal}
        onContinue={handleContinueSession}
        isChangingToken={isChangingToken}
        onLogout={logout}
        timeLeft={formatTime()}
      />
    </div>
  );
};
