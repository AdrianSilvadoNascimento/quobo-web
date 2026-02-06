import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { planService } from '../services/plan.service';
import { useAuth } from '@/contexts/AuthContext';
import QuoboIcon from '@/assets/quobo-icon.svg';
import { Button, Loader } from '@/components/ui';

type PageState = 'loading' | 'success' | 'error';

export const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { updateSubscriptionStatus } = useAuth();
  const [state, setState] = useState<PageState>('loading');
  const [sessionData, setSessionData] = useState<{
    id: string;
    status: string;
    payment_status: string;
    customer_email: string;
  } | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setState('error');
      return;
    }

    const verifySession = async () => {
      try {
        const data = await planService.verifyCheckoutSession(sessionId);
        setSessionData(data);

        if (data.payment_status === 'paid') {
          setState('success');

          // Invalidar cache para atualizar frontend automaticamente
          queryClient.invalidateQueries({ queryKey: ['finance'] });
          queryClient.invalidateQueries({ queryKey: ['auth'] });

          // CRÍTICO: Atualizar contexto de autenticação para fechar modal de assinatura expirada
          updateSubscriptionStatus();
        } else {
          setState('error');
        }
      } catch (error) {
        console.error('Error verifying checkout session:', error);
        setState('error');
      }
    };

    verifySession();
  }, [searchParams, queryClient, updateSubscriptionStatus]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center border-2 border-white shadow-md w-12 h-12 rounded-full bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF]">
              <img src={QuoboIcon} alt="Quobo Logo" className="w-10 h-auto" />
            </div>
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF]">
              Quobo
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-200">
          {state === 'loading' && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <Loader size="lg" className="text-brand-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Verificando seu pagamento...
              </h2>
              <p className="text-slate-600">
                Aguarde enquanto confirmamos sua assinatura
              </p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center">
              {/* Success Animation */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4 shadow-lg">
                    <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-3xl font-extrabold text-slate-900">
                    Pagamento Confirmado!
                  </h2>
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-lg text-slate-600 mb-6">
                  Sua assinatura foi ativada com sucesso
                </p>

                {/* Session Info */}
                {sessionData && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium">Status do Pagamento:</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold text-xs uppercase">
                          Pago
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium">Email:</span>
                        <span className="text-slate-800 font-semibold">{sessionData.customer_email}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium">ID da Sessão:</span>
                        <span className="text-slate-500 font-mono text-xs">{sessionData.id.substring(0, 20)}...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Benefits */}
                <div className="bg-slate-50 rounded-xl p-6 mb-8">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    O que você ganhou:
                  </h3>
                  <ul className="space-y-2 text-left max-w-md mx-auto">
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Acesso completo a todas as funcionalidades do plano</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Suporte técnico dedicado</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Atualizações automáticas e melhorias contínuas</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleGoToDashboard}
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                Ir para o Dashboard
              </Button>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-12">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <XCircle className="w-16 h-16 text-red-600" strokeWidth={2} />
                </div>
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Não foi possível verificar o pagamento
              </h2>
              <p className="text-slate-600 mb-8">
                Ocorreu um erro ao verificar sua sessão de checkout. Por favor, entre em contato com o suporte se o problema persistir.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  Voltar para Planos
                </Button>
                <Button
                  size="lg"
                  onClick={handleGoToDashboard}
                >
                  Ir para o Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>
            Você receberá um email de confirmação em breve.
            <br />
            Para gerenciar sua assinatura, acesse{' '}
            <Button
              onClick={() => navigate('/account/finance')}
              variant="back"
            >
              Configurações de Conta
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};
