import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Check, Star, Shield, Zap, HelpCircle, Lightbulb } from 'lucide-react';

import type { PlanModel } from '@/features/checkout/types/plan.model';

import { planService } from '../services/plan.service';
import QuoboIcon from '@/assets/quobo-icon.svg';

const APP_URL = import.meta.env.VITE_APP_URL;

interface CheckoutPageProps {
  withHeader?: boolean;
}

type BillingPeriod = 'MONTHLY' | 'SEMI_ANNUAL' | 'ANNUAL';

const BILLING_PERIODS: { key: BillingPeriod; label: string; badge?: string }[] = [
  { key: 'MONTHLY', label: 'Mensal' },
  { key: 'SEMI_ANNUAL', label: 'Semestral', badge: 'Economize 15%' },
  { key: 'ANNUAL', label: 'Anual', badge: 'Economize 25%' },
];

const TIER_ORDER = ['BRONZE', 'PRATA', 'OURO'];

const TIER_CONFIG: Record<string, { gradient: string; button: string; badge: string; icon: React.ElementType }> = {
  BRONZE: {
    gradient: 'from-orange-100 to-orange-50 border-orange-200',
    button: 'bg-orange-600 hover:bg-orange-700 text-white',
    badge: 'bg-orange-100 text-orange-800',
    icon: Lightbulb
  },
  PRATA: {
    gradient: 'from-slate-100 to-slate-50 border-slate-200',
    button: 'bg-slate-800 hover:bg-slate-900 text-white',
    badge: 'bg-slate-100 text-slate-800',
    icon: Star
  },
  OURO: {
    gradient: 'from-amber-100 to-amber-50 border-amber-200',
    button: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-amber-500/30',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: Zap
  },
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ withHeader = false }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('MONTHLY');

  const { data: allPlans = [], isLoading } = useQuery({
    queryKey: ['plan'],
    queryFn: () => planService.getPlans(),
  });

  // Filtrar apenas planos com Stripe configurado (excluir legados)
  const stripePlans = allPlans.filter(
    (plan) => plan.stripe_lookup_key !== null && plan.stripe_lookup_key !== undefined
  );

  // Filtrar planos pela periodicidade selecionada e ordenar por tier
  const filteredPlans = stripePlans
    .filter((plan) => plan.billing_period === selectedPeriod)
    .sort((a, b) => {
      const tierA = TIER_ORDER.indexOf(a.tier || '');
      const tierB = TIER_ORDER.indexOf(b.tier || '');
      return tierA - tierB;
    });

  const handleSelectPlan = async (plan: PlanModel) => {
    try {
      const { sessionUrl } = await planService.createCheckoutSession(
        plan.id,
        `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        window.location.href
      );

      if (sessionUrl) {
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      alert('Não foi possível iniciar o checkout. Tente novamente.');
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'MONTHLY':
        return '/mês';
      case 'SEMI_ANNUAL':
        return '/semestre';
      case 'ANNUAL':
        return '/ano';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-brand-600"></div>
          <p className="mt-4 text-slate-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

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
        <div className="text-center mb-10">
          <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Planos e Preços</h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Escolha o plano ideal para o seu negócio
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Desbloqueie todo o potencial da sua gestão com nossos planos flexíveis.
            Cancele ou altere quando quiser.
          </p>
        </div>

        {/* Billing Period Selector */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex gap-4 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
            {BILLING_PERIODS.map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`
                  cursor-pointer relative px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
                  ${selectedPeriod === period.key
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                {period.label}
                {period.badge && selectedPeriod === period.key && (
                  <span className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-fade-in-up">
                    {period.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => {
              const tier = plan.tier || 'BRONZE';
              const config = TIER_CONFIG[tier] || TIER_CONFIG['BRONZE'];
              const isPopular = tier === 'PRATA';
              const isPremium = tier === 'OURO';
              const Icon = config.icon;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl transition-all duration-300 flex flex-col
                    ${isPopular
                      ? 'scale-105 shadow-2xl z-10 ring-1 ring-slate-200 hover:-translate-y-2'
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

                  <div className={`p-8 rounded-t-2xl bg-gradient-to-b ${config.gradient}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-slate-800">{plan.name.split('-')[0].trim()}</h3>
                      {/* Icone do plano */}
                      <div className={`p-2 rounded-lg ${tier === 'BRONZE' ? 'bg-orange-100/50' : tier === 'PRATA' ? 'bg-slate-200/50' : 'bg-amber-100/50'}`}>
                        <Icon className={`w-6 h-6 ${tier === 'BRONZE' ? 'text-orange-600' : tier === 'PRATA' ? 'text-slate-700' : 'text-amber-600'}`} />
                      </div>
                    </div>

                    <p className="text-slate-600 min-h-[3rem] text-sm leading-relaxed mb-4">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline">
                      <span className="text-sm font-semibold text-slate-500">R$</span>
                      <span className="text-5xl font-extrabold text-slate-900 tracking-tight ml-1">
                        {(plan.value / 100).toFixed(2).split('.')[0]}
                      </span>
                      <span className="text-2xl font-bold text-slate-700">,{(plan.value / 100).toFixed(2).split('.')[1]}</span>
                      <span className="text-slate-500 ml-2">{getPeriodLabel(plan.billing_period || 'MONTHLY')}</span>
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
                            {feature.replace('✓ ', '')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`btn btn-lg w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-200 transform active:scale-[0.98] border-none ${config.button}`}
                    >
                      Assinar {plan.name.split('-')[0].trim()}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-slate-500 text-lg">Nenhum plano encontrado para a periodicidade selecionada.</p>
            </div>
          )}
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
            <p className="text-sm text-slate-500 max-w-xs">Seus dados protegidos com a mais alta tecnologia de segurança bancária via Stripe.</p>
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
    </div>
  );
};
