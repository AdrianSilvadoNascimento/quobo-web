import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';

interface ExpiredSubscriptionModalProps {
  isTrial: boolean;
  onChoosePlan: () => void;
}

export const ExpiredSubscriptionModal: React.FC<ExpiredSubscriptionModalProps> = ({ isTrial, onChoosePlan }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleGoToCheckout = () => {
    onChoosePlan(); // Dismiss the modal
    navigate('/checkout');
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md relative bg-white shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        {/* Title and Message */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            {isTrial ? 'Seu período de teste expirou' : 'Sua assinatura expirou'}
          </h3>
          <p className="text-slate-600 leading-relaxed">
            {isTrial
              ? 'Para continuar aproveitando todos os recursos do Quobo, escolha um de nossos planos e mantenha seu negócio sempre em movimento.'
              : 'Para continuar utilizando o Quobo, renove sua assinatura e retome o controle total do seu estoque.'}
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

        {/* CTA Button */}
        <Button
          onClick={handleGoToCheckout}
          icon={<CreditCard className="w-5 h-5" />}
          className="w-full h-12"
        >
          {isTrial ? 'Escolher Plano' : 'Renovar Assinatura'}
        </Button>

        <Button variant="ghost" onClick={logout} className="w-full text-red-600 mt-3">
          Sair
        </Button>
      </div>
    </div>
  );
};
