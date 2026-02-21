import React, { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreditCard, Lock, PartyPopper, ShieldCheck, X } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { AlertModal, type AlertType } from '@/components/AlertModal';

import { PaymentIcon } from 'react-svg-credit-card-payment-icons';
import confetti from 'canvas-confetti';

import { efiService } from '../services/efi.service';
import { planService } from '../services/plan.service';
import { CreditCard3D } from './CreditCard3D';
import { type PlanModel, CreditCardModel } from '../types/plan.model';
import type { SubscriptionModel, AccountCardModel } from '@/features/account/types/account.model';
import { getBillingPeriod } from '@/utils/planHelpers';

interface CheckoutModalProps {
  plan: PlanModel;
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { refreshToken, user, account } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardData, setCardData] = useState<CreditCardModel>({
    card_number: '',
    card_holder_name: '',
    holder_document: '',
    expiration_month: new Date().getMonth() + 1,
    expiration_year: new Date().getFullYear(),
    security_code: '',
    brand: '',
  });


  // Alert Modal State
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as AlertType,
  });

  const showAlert = (title: string, message: string, type: AlertType = 'info') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }));
  };

  const debouncedBrand = useDebounce(cardData.card_number, 150);

  useEffect(() => {
    efiService.checkScriptBlocking();
  }, []);

  const handleInputChange = (field: keyof CreditCardModel, value: string | number) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const formatCPFCNPJ = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      handleInputChange('card_number', value);
    }
  };

  const handleCPFCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      handleInputChange('holder_document', value);
    }
  };

  useEffect(() => {
    if (cardData.card_number.length < 6) return;

    const fetchBrand = async () => {
      cardData.brand = await efiService.identifyBrand(cardData.card_number);
    }

    fetchBrand();
  }, [debouncedBrand]);


  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Generate Payment Token
      const card = {
        card_number: cardData.card_number,
        holder_name: cardData.card_holder_name,
        expiration_month: String(cardData.expiration_month),
        expiration_year: String(cardData.expiration_year),
        security_code: cardData.security_code,
        holder_document: cardData.holder_document,
        brand: cardData.brand,
      };

      const { token: generatedToken, card_mask: generatedMask } = await efiService.generateToken(card);

      if (!generatedToken) {
        showAlert(
          'Erro no Token de Pagamento',
          'Não foi possível gerar o token de pagamento. Por favor, verifique os dados do cartão e tente novamente.',
          'error'
        );
        setIsLoading(false);
        return;
      }


      if (!user || !account) {
        showAlert(
          'Erro de Autenticação',
          'Não foi possível identificar o usuário. Por favor, faça login novamente.',
          'error'
        );
        setIsLoading(false);
        return;
      }

      const subscriptionData: Partial<SubscriptionModel> = {
        plan_id: plan.id,
        account_id: account.id,
        account_user_id: user.id,
        credit_card_token: generatedToken, // Use generatedToken directly
        card_mask: generatedMask, // Use generatedMask directly
        expiration_date: `${String(cardData.expiration_month).padStart(2, '0')}/${cardData.expiration_year}`,
        brand: cardData.brand,
        holder_document: cardData.holder_document,
      };

      const accountCardData: Partial<AccountCardModel> = {
        card_token: generatedToken, // Use generatedToken directly
        card_mask: generatedMask, // Use generatedMask directly
        expiration_date: `${String(cardData.expiration_month).padStart(2, '0')}/${cardData.expiration_year}` as any,
        brand: cardData.brand,
        account_id: account.id,
        customer_document: cardData.holder_document,
      };

      await planService.createSubscription({
        subscription: subscriptionData as SubscriptionModel,
        card: accountCardData as AccountCardModel
      });

      // Update subscription status before showing success
      refreshToken();

      // Show success modal and confetti
      setIsSuccessOpen(true);
      triggerConfetti();

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Checkout error:', error);

      // Extract error message from API response
      let errorTitle = 'Erro no Processamento';
      let errorMessage = 'Ocorreu um erro ao processar seu checkout. Por favor, verifique seus dados e tente novamente.';

      if (error?.response?.data) {
        const { message, details } = error.response.data;
        if (message) errorMessage = message;

        // Helper to format details if they are an object/array
        if (details) {
          if (typeof details === 'string') {
            errorMessage += `\n${details}`;
          } else if (typeof details === 'object') {
            // Try to find specific field errors or join them
            const detailsStr = Object.values(details).filter(v => typeof v === 'string').join('\n');
            if (detailsStr) errorMessage += `\n${detailsStr}`;
            else errorMessage += `\n${JSON.stringify(details)}`;
          }
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Check for specific error types
      if (error?.response?.status === 400) {
        errorTitle = 'Dados Inválidos';
      } else if (error?.response?.status === 401) {
        errorTitle = 'Não Autorizado';
        errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
      } else if (error?.response?.status === 500) {
        errorTitle = 'Erro no Servidor';
      }

      showAlert(errorTitle, errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const submitButton = () => {
    let buttonLabel = 'Confirmar Assinatura'
    if (isLoading) {
      buttonLabel = 'Processando...'
    }

    return (
      <>
        {isLoading && <span className="loading loading-spinner"></span>}
        {buttonLabel}
      </>
    );
  };

  const handleGoToDashboard = () => {
    setIsSuccessOpen(false);
    onClose();
    navigate('/dashboard');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal modal-open backdrop-blur-sm bg-black/30">
        <div className="modal-box max-w-5xl p-0 overflow-hidden bg-white shadow-2xl rounded-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 btn btn-sm btn-circle btn-ghost z-50 hover:bg-slate-100"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>

          <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto lg:overflow-hidden">
            {/* Left Column: Plan Summary & 3D Card */}
            <div className="lg:w-5/12 bg-slate-50 p-8 flex flex-col justify-between border-r border-slate-100">
              <div>
                <h3 className="font-bold text-2xl text-slate-800 mb-2">Resumo do Pedido</h3>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {plan.name === 'Ouro' ? (
                        <h4 className="font-bold bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 bg-clip-text text-transparent text-lg duration-150 transition-colors">Plano {plan.name}</h4>
                      ) : (
                        <h4 className="font-bold text-lg text-slate-800">Plano {plan.name}</h4>
                      )}
                      <p className="text-xs text-slate-500">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-brand-600 flex flex-row items-baseline gap-1">
                        <span className="text-md text-slate-800">R$</span>
                        <span className="text-2xl text-slate-800">{(plan.value / 100).toFixed(2).replace('.', ',')}</span>
                        <span className="text-xs text-slate-400">/{getBillingPeriod(plan.interval)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="divider my-2"></div>
                  <ul className="text-sm space-y-2 text-slate-600">
                    <li className="flex justify-between">
                      <span>Limite de Produtos</span>
                      <span className="font-medium">
                        {plan.features.product_limits.unlimited
                          ? 'Ilimitados'
                          : plan.features.product_limits.max_products}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Usuários</span>
                      <span className="font-medium">
                        {plan.features.user_limits.unlimited
                          ? 'Ilimitados'
                          : plan.features.user_limits.max_users}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 3D Card Container */}
                <div className="hidden lg:flex justify-center items-center py-8 perspective-1000">
                  <CreditCard3D
                    cardNumber={cardData.card_number}
                    holderName={cardData.card_holder_name}
                    expiryMonth={cardData.expiration_month}
                    expiryYear={cardData.expiration_year}
                    cvv={cardData.security_code}
                    isFlipped={isFlipped}
                  />
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-3 text-slate-400 text-xs justify-center mt-4">
                <ShieldCheck className="w-4 h-4" />
                <span>Pagamento 100% seguro e criptografado</span>
              </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="lg:w-7/12 p-8 bg-white overflow-y-auto">
              <div className="mb-6">
                <h3 className="font-bold text-2xl text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-brand-600" />
                  Dados do Pagamento
                </h3>
                <p className="text-slate-500 mt-1">Preencha os dados do seu cartão de crédito</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Mobile Card Preview (Hidden on Desktop) */}
                <div className="lg:hidden mb-6 flex justify-center">
                  <div className="scale-75 origin-top w-[380px] max-w-full">
                    <CreditCard3D
                      cardNumber={cardData.card_number}
                      holderName={cardData.card_holder_name}
                      expiryMonth={cardData.expiration_month}
                      expiryYear={cardData.expiration_year}
                      cvv={cardData.security_code}
                      isFlipped={isFlipped}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-slate-700">Número do Cartão</span>
                  </label>

                  <div className="relative transition-all">
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      className="input input-bordered w-full focus:input-primary transition-all pr-12"
                      value={formatCardNumber(cardData.card_number)}
                      onChange={handleCardNumberChange}
                      onFocus={() => setIsFlipped(false)}
                      required
                      maxLength={19}
                    />
                    {cardData.brand && cardData.card_number.length >= 16 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        <PaymentIcon type={efiService.normalizeBrand(cardData.brand)} format='flatRounded' />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-slate-700">Nome no Cartão</span>
                  </label>
                  <input
                    type="text"
                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                    className="input input-bordered w-full focus:input-primary transition-all uppercase"
                    value={cardData.card_holder_name}
                    onChange={(e) => handleInputChange('card_holder_name', e.target.value.toUpperCase())}
                    onFocus={() => setIsFlipped(false)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-slate-700">Validade</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="select select-bordered w-full focus:select-primary"
                        value={cardData.expiration_month}
                        onChange={(e) => handleInputChange('expiration_month', parseInt(e.target.value))}
                        onFocus={() => setIsFlipped(false)}
                        required
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={month}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <select
                        className="select select-bordered w-full focus:select-primary"
                        value={cardData.expiration_year}
                        onChange={(e) => handleInputChange('expiration_year', parseInt(e.target.value))}
                        onFocus={() => setIsFlipped(false)}
                        required
                      >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-slate-700">CVV</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="123"
                        className="input input-bordered w-full focus:input-primary transition-all"
                        value={cardData.security_code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 4) handleInputChange('security_code', value);
                        }}
                        onFocus={() => setIsFlipped(true)}
                        onBlur={() => setIsFlipped(false)}
                        required
                        maxLength={4}
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-slate-700">CPF/CNPJ do Titular</span>
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="input input-bordered w-full focus:input-primary transition-all"
                    value={formatCPFCNPJ(cardData.holder_document)}
                    onChange={handleCPFCNPJChange}
                    onFocus={() => setIsFlipped(false)}
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block h-12 text-lg shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all"
                    disabled={isLoading}
                  >
                    {submitButton()}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    Ao confirmar, você concorda com nossos Termos de Uso e Política de Privacidade.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={onClose}>
          <button>close</button>
        </form>
      </div>

      {/* --- Success Modal --- */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-100 rounded-full blur-3xl -z-10 opacity-60"></div>

            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white">
              <PartyPopper className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Assinatura Confirmada!</h2>
            <p className="text-slate-500 mb-8">
              Parabéns! Você agora é um assinante <strong>{plan.name}</strong>. Aproveite todos os recursos desbloqueados.
            </p>

            <button
              onClick={handleGoToDashboard}
              className="w-full bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
            >
              Ir para o Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </>
  );
};
