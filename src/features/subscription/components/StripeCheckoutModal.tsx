import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, ShieldCheck, Lock, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

import type { PlanModel } from '@/features/checkout/types/plan.model';
import { subscriptionService } from '../services/subscription.service';
import { useAuth } from '@/contexts/AuthContext';
import { getBillingPeriod } from '@/utils/planHelpers';

interface StripeCheckoutModalProps {
  plan: PlanModel;
  isOpen: boolean;
  onClose: () => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  plan,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { refreshToken } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe ainda não foi carregado. Por favor, aguarde.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Elemento do cartão não encontrado');
      }

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Erro ao processar cartão');
      }

      if (!paymentMethod) {
        throw new Error('Não foi possível criar o método de pagamento');
      }

      await subscriptionService.createSubscription({
        planId: plan.id,
        paymentMethodId: paymentMethod.id,
      });

      refreshToken();

      setIsSuccessOpen(true);
      triggerConfetti();

      setTimeout(() => {
        setIsSuccessOpen(false);
        onClose();
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Erro ao processar pagamento. Tente novamente.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        '::placeholder': {
          color: '#94a3b8',
        },
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      },
      invalid: {
        color: '#ef4444',
      },
    },
    hidePostalCode: true, // Oculta ZIP/CEP pois não é necessário no Brasil
  };

  return (
    <>
      <div className="modal modal-open backdrop-blur-sm bg-black/30">
        <div className="modal-box max-w-2xl p-0 overflow-hidden bg-white shadow-2xl rounded-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 btn btn-sm btn-circle btn-ghost z-50 hover:bg-slate-100"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h3 className="font-bold text-2xl text-slate-800 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-brand-600" />
                Finalizar Assinatura
              </h3>
              <p className="text-slate-500 mt-1">
                Plano {plan.name} - R$ {(plan.value / 100).toFixed(2).replace('.', ',')}{getBillingPeriod(plan.interval)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Element */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-slate-700">
                    Dados do Cartão
                  </span>
                </label>
                <div className="p-4 border-2 border-slate-200 rounded-lg focus-within:border-brand-500 transition-colors">
                  <CardElement options={cardElementOptions} />
                </div>
                <label className="label">
                  <span className="label-text-alt text-slate-500">
                    Digite o número do cartão, validade (MM/AA) e código de segurança (CVV)
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-error shadow-lg">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current flex-shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="btn btn-primary btn-block h-12 text-lg shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all"
              >
                {isProcessing ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Processando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Confirmar Assinatura
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                <ShieldCheck className="w-4 h-4 inline mr-1" />
                Pagamento 100% seguro processado pelo Stripe
              </p>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={onClose}>
          <button>close</button>
        </form>
      </div>

      {/* Success Modal */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-100 rounded-full blur-3xl -z-10 opacity-60"></div>

            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white">
              <PartyPopper className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Assinatura Confirmada!
            </h2>
            <p className="text-slate-500 mb-4">
              Parabéns! Você agora é um assinante <strong>{plan.name}</strong>.
              Aproveite todos os recursos!
            </p>
          </div>
        </div>
      )}
    </>
  );
};
