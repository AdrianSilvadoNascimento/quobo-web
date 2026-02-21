import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';

interface ExpiredSubscriptionModalProps {
  isTrial: boolean;
  onChoosePlan?: () => void;
}

export const ExpiredSubscriptionModal: React.FC<ExpiredSubscriptionModalProps> = ({ isTrial, onChoosePlan }) => {
  const { logout, isSubscriptionSuspended } = useAuth();
  const navigate = useNavigate();

  const handleGoToCheckout = () => {
    onChoosePlan?.(); // Dismiss the modal (only works for non-suspended)
    navigate('/checkout');
  };

  const handleGoToFinance = () => {
    onChoosePlan?.(); // Dismiss the modal (only works for non-suspended)
    navigate('/account/finance');
  };

  // Determine if this is a suspension (payment issue) vs trial/expired
  const isSuspended = isSubscriptionSuspended;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md relative bg-white shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isSuspended
            ? 'bg-gradient-to-br from-red-100 to-red-200'
            : 'bg-gradient-to-br from-orange-100 to-red-100'
            }`}>
            {isSuspended
              ? <AlertTriangle className="w-10 h-10 text-red-600" />
              : <Clock className="w-10 h-10 text-orange-600" />
            }
          </div>
        </div>

        {/* Title and Message */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            {isSuspended
              ? 'Sua assinatura está suspensa'
              : isTrial
                ? 'Seu período de teste expirou'
                : 'Sua assinatura expirou'
            }
          </h3>
          <p className="text-slate-600 leading-relaxed">
            {isSuspended
              ? 'Não foi possível processar o pagamento da sua assinatura. Verifique seu método de pagamento na área financeira para regularizar sua conta e continuar utilizando o Quobo.'
              : isTrial
                ? 'Para continuar aproveitando todos os recursos do Quobo, escolha um de nossos planos e mantenha seu negócio sempre em movimento.'
                : 'Para continuar utilizando o Quobo, renove sua assinatura e retome o controle total do seu estoque.'
            }
          </p>
        </div>

        {/* Benefits Reminder */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-2">
            O que você está perdendo:
          </p>
          <ul className="space-y-1 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
              Gestão completa de produtos e estoque
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
              Relatórios e análises em tempo real
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
              Controle de vendas e clientes
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        {isSuspended ? (
          <>
            <Button
              onClick={handleGoToFinance}
              icon={<CreditCard className="w-5 h-5" />}
              className="w-full h-12"
            >
              Verificar Pagamento
            </Button>
            <Button
              onClick={handleGoToCheckout}
              variant="ghost"
              className="w-full mt-2 text-brand-600"
            >
              Trocar de Plano
            </Button>
          </>
        ) : (
          <Button
            onClick={handleGoToCheckout}
            icon={<CreditCard className="w-5 h-5" />}
            className="w-full h-12"
          >
            {isTrial ? 'Escolher Plano' : 'Renovar Assinatura'}
          </Button>
        )}

        <Button variant="ghost" onClick={logout} className="w-full text-red-600 mt-3">
          Sair
        </Button>
      </div>
    </div>
  );
};
