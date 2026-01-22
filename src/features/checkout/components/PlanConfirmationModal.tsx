import React from 'react';
import { X, Check, Sparkles, Shield } from 'lucide-react';
import type { PlanModel } from '../types/plan.model';

interface PlanConfirmationModalProps {
  plan: PlanModel;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const TIER_CONFIG: Record<string, { gradient: string; accent: string }> = {
  BRONZE: {
    gradient: 'from-orange-500/10 to-orange-100/10',
    accent: 'text-orange-600'
  },
  PRATA: {
    gradient: 'from-slate-500/10 to-slate-100/10',
    accent: 'text-slate-700'
  },
  OURO: {
    gradient: 'from-amber-500/10 to-yellow-100/10',
    accent: 'text-amber-600'
  },
};

export const PlanConfirmationModal: React.FC<PlanConfirmationModalProps> = ({
  plan,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const tier = plan.tier || 'BRONZE';
  const config = TIER_CONFIG[tier] || TIER_CONFIG['BRONZE'];

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'MONTHLY':
        return 'Mensalmente';
      case 'SEMI_ANNUAL':
        return 'Semestralmente';
      case 'ANNUAL':
        return 'Anualmente';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto transform transition-all duration-300 scale-100 animate-modal-appear"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`relative bg-gradient-to-br ${config.gradient} p-6 rounded-t-2xl border-b border-slate-100`}>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier === 'BRONZE' ? 'from-orange-400 to-orange-600' :
                    tier === 'PRATA' ? 'from-slate-600 to-slate-800' :
                      'from-amber-400 to-yellow-600'
                  } flex items-center justify-center shadow-lg`}>
                  <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">
                  Confirmar Assinatura
                </h3>
                <p className="text-slate-600 text-sm">
                  Você está prestes a assinar o plano:
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Plan Details */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-baseline justify-between mb-3">
                <h4 className={`text-xl font-bold ${config.accent}`}>
                  {plan.name.split('-')[0].trim()}
                </h4>
                <div className="flex items-baseline">
                  <span className="text-sm font-semibold text-slate-500">R$</span>
                  <span className="text-3xl font-extrabold text-slate-900 ml-1">
                    {(plan.value / 100).toFixed(2).split('.')[0]}
                  </span>
                  <span className="text-xl font-bold text-slate-700">
                    ,{(plan.value / 100).toFixed(2).split('.')[1]}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-3">{plan.description}</p>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white rounded-lg px-3 py-2 border border-slate-200">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Cobrança {getPeriodLabel(plan.billing_period || 'MONTHLY').toLowerCase()}</span>
              </div>
            </div>

            {/* Features Preview */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">O que está incluído:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {plan.feature_list.slice(0, 5).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-0.5 p-0.5 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-slate-600">
                      {feature.replace('✓ ', '')}
                    </span>
                  </div>
                ))}
                {plan.feature_list.length > 5 && (
                  <p className="text-xs text-slate-500 italic pl-5">
                    + {plan.feature_list.length - 5} outros benefícios
                  </p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>💡 Importante:</strong> Você será redirecionado para o checkout seguro do Stripe.
                Você pode cancelar sua assinatura a qualquer momento, sem multas.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 btn btn-outline border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 btn rounded-xl font-semibold text-white border-none shadow-lg transition-all duration-200 ${tier === 'BRONZE' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30' :
                  tier === 'PRATA' ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-500/30' :
                    'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-amber-500/40'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Iniciando checkout...
                </span>
              ) : (
                'Confirmar e Prosseguir'
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-modal-appear {
          animation: modal-appear 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};
