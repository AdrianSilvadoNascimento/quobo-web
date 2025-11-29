import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Check, Star, Shield, Zap, HelpCircle, Lightbulb } from 'lucide-react';

import { CheckoutModal } from '../components/CheckoutModal';
import type { PlanModel } from '@/features/checkout/types/plan.model';

import { planService } from '../services/plan.service';

import QuoboIcon from '@/assets/quobo-icon.svg';

interface CheckoutPageProps {
  withHeader?: boolean;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ withHeader = false }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ['plan'],
    queryFn: () => planService.getPlans(),
  });

  const handleSelectPlan = (plan: PlanModel) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const getPlanGradient = (planName: string): string => {
    switch (planName) {
      case 'Bronze':
        return 'from-orange-100 to-orange-50 border-orange-200';
      case 'Prata':
        return 'from-slate-100 to-slate-50 border-slate-200';
      case 'Ouro':
        return 'from-amber-100 to-amber-50 border-amber-200';
      default:
        return 'from-gray-50 to-white border-gray-200';
    }
  };

  const getButtonColor = (planName: string): string => {
    switch (planName) {
      case 'Bronze':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'Prata':
        return 'bg-slate-800 hover:bg-slate-900 text-white';
      case 'Ouro':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-amber-500/30';
      default:
        return 'btn-outline';
    }
  };

  return (
    <div className="min-h-full bg-slate-50/50">
      {withHeader && (
        <header className="bg-white border-b border-slate-200 py-4 px-6 mb-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 font-bold text-2xl text-brand-700">
            <div className="flex items-center justify-center border-2 border-white shadow-md w-10 h-10 rounded-full bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF]">
              <img src={QuoboIcon} alt="Quobo Logo" className="w-8 h-auto" />
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF]">Quobo</span>
          </div>
        </header>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${!withHeader ? 'py-12' : 'pb-12'}`}>
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Planos e Preços</h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Escolha o plano ideal para o seu negócio
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Desbloqueie todo o potencial da sua gestão com nossos planos flexíveis.
            Cancele ou altere quando quiser.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => {
            const isPopular = plan.name.includes('Prata');
            const isPremium = plan.name.includes('Ouro');
            const isSuggestion = plan.name.includes('Bronze');

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl transition-all duration-300 flex flex-col
                  ${isPopular
                    ? 'scale-105 shadow-2xl z-10 ring-1 ring-slate-200 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]'
                    : 'hover:shadow-xl hover:-translate-y-1 shadow-lg'
                  }
                  bg-white border ${isPopular ? 'border-slate-300' : 'border-slate-100'}
                `}
              >
                {isPopular && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center">
                    <span className="bg-slate-800 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" /> Mais Popular
                    </span>
                  </div>
                )}

                {isPremium && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Zap className="w-4 h-4 fill-current" /> Recomendado
                    </span>
                  </div>
                )}

                {isSuggestion && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-amber-100 to-amber-50 text-slate-600 text-sm font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 fill-current" /> Ideal para conhecer
                    </span>
                  </div>
                )}

                <div className={`p-8 rounded-t-2xl bg-gradient-to-b ${getPlanGradient(plan.name)}`}>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 min-h-[3rem] text-sm leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline">
                    <span className="text-sm font-semibold text-slate-500">R$</span>
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight ml-1">
                      {(plan.value / 100).toFixed(2).split('.')[0]}
                    </span>
                    <span className="text-2xl font-bold text-slate-700">,{(plan.value / 100).toFixed(2).split('.')[1]}</span>
                    <span className="text-slate-500 ml-2">/mês</span>
                  </div>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  <div className="space-y-4 mb-8 flex-grow">
                    {plan.feature_list.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 group">
                        <div className={`mt-1 p-0.5 rounded-full ${isPremium ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </div>
                        <span className="text-slate-600 text-sm group-hover:text-slate-900 transition-colors">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`btn btn-lg w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-200 transform active:scale-[0.98] ${getButtonColor(plan.name)}`}
                  >
                    Escolher Plano {plan.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Perguntas Frequentes</h2>
            <p className="text-slate-500">Tire suas dúvidas sobre nossos planos</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Posso mudar de plano a qualquer momento?",
                answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações de valor serão aplicadas proporcionalmente no próximo ciclo de cobrança."
              },
              {
                question: "Existe período de fidelidade?",
                answer: "Não. Nossos planos são mensais e você pode cancelar a qualquer momento sem multas. Oferecemos também um período de 7 dias de garantia para novos assinantes."
              },
              {
                question: "Como funciona o suporte?",
                answer: "Todos os planos incluem suporte via email. O plano Ouro conta com atendimento prioritário via WhatsApp e gerente de conta dedicado."
              },
              {
                question: "Meus dados estão seguros?",
                answer: "Absolutamente. Utilizamos criptografia de ponta a ponta e backups diários automáticos para garantir a segurança total das suas informações."
              }
            ].map((faq, idx) => (
              <div key={idx} className="collapse collapse-plus bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <input type="radio" name="faq-accordion" defaultChecked={idx === 0} />
                <div className="collapse-title text-lg font-medium text-slate-800 flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-brand-500" />
                  {faq.question}
                </div>
                <div className="collapse-content">
                  <p className="text-slate-600 leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-20 pt-10 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800">Pagamento Seguro</h3>
            <p className="text-sm text-slate-500 max-w-xs">Seus dados protegidos com a mais alta tecnologia de segurança bancária.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-2">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800">Sem Burocracia</h3>
            <p className="text-sm text-slate-500 max-w-xs">Cancele quando quiser, sem letras miúdas ou taxas escondidas.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-2">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800">Suporte Premium</h3>
            <p className="text-sm text-slate-500 max-w-xs">Equipe especializada pronta para ajudar você a crescer.</p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
