import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { authService } from '@/features/auth/services/auth.service';
import { popRedirectPath } from '@/contexts/AuthContext';
import { publicInviteService } from '@/features/team/services/public-invite.service';
import QuoboIcon from '@/assets/quobo-icon.png';

/**
 * Handles OAuth/email redirect callbacks from Supabase.
 * Supabase redirects here with tokens in the URL hash fragment.
 * This page exchanges them for a backend session via handshake.
 */
export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically picks up the tokens from the URL hash
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!data.session?.access_token) {
          throw new Error('Nenhuma sessão encontrada. Tente fazer login novamente.');
        }

        // Handle pending invite acceptance via Google OAuth
        const pendingInviteToken = localStorage.getItem('pending_invite_token');
        if (pendingInviteToken) {
          localStorage.removeItem('pending_invite_token');
          const inviteResult = await publicInviteService.acceptInviteWithGoogle(
            pendingInviteToken,
            data.session.access_token,
          );
          if (!inviteResult.success) {
            throw new Error(inviteResult.message || 'Erro ao aceitar convite. Verifique se o email do Google corresponde ao convite.');
          }
        }

        // Perform handshake with backend
        const response = await authService.handshake(data.session.access_token);

        if (!response?.token) {
          throw new Error('Falha ao sincronizar sessão com o servidor.');
        }

        authService.setAccessToken(response.token);

        // Store session data
        localStorage.setItem('session_active', 'true');
        if (response.account_user) localStorage.setItem('user_data', JSON.stringify(response.account_user));
        if (response.account) localStorage.setItem('account_data', JSON.stringify(response.account));
        if ((response as any).subscription) localStorage.setItem('subscription_data', JSON.stringify((response as any).subscription));
        if ((response as any).expiration_days != null) localStorage.setItem('expiration_days', (response as any).expiration_days.toString());
        localStorage.setItem('is_trial', (response as any).is_trial?.toString() || 'false');
        localStorage.setItem('is_assinant', (response as any).is_assinant?.toString() || 'false');
        if ((response as any).expiration_date) localStorage.setItem('expiration_date', (response as any).expiration_date.toString());

        // Redirect to saved path or dashboard
        const redirectPath = popRedirectPath();
        window.location.href = redirectPath || '/dashboard';
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Erro ao processar autenticação.');

        // Redirect to login after showing error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF]">
      <div className="flex flex-col items-center gap-6">
        <img src={QuoboIcon} alt="Quobo" className="w-20 h-auto drop-shadow-2xl" />

        {!error ? (
          <>
            <span className="loading loading-spinner loading-lg text-white"></span>
            <p className="text-white/90 text-sm font-medium">Autenticando...</p>
          </>
        ) : (
          <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-6 max-w-sm text-center">
            <p className="text-red-600 font-medium mb-2">Erro na autenticação</p>
            <p className="text-sm text-slate-500">{error}</p>
            <p className="text-xs text-slate-400 mt-4">Redirecionando para o login...</p>
          </div>
        )}
      </div>
    </div>
  );
};
