import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Download, Clock, CheckCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { accountApi } from '@/services/accountApi';
import { CancelSubscriptionModal } from '../components/CancelSubscriptionModal';

import { useSubscriptionSocket } from '@/hooks/useSubscriptionSocket';

export const FinancePage: React.FC = () => {
  const { account } = useAuth();
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const accountId = account?.id;

  // Listen for real-time updates
  const { lastUpdate } = useSubscriptionSocket(accountId);

  const { data: financeData, isLoading, error, refetch } = useQuery({
    queryKey: ['finance'],
    queryFn: () => accountApi.getFinanceData(),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
  });

  // Refetch when socket notifies of changes
  React.useEffect(() => {
    if (lastUpdate) {
      refetch();
    }
  }, [lastUpdate, refetch]);

  const formattedSubscription = useMemo(() => {
    if (!financeData?.subscription) return null;

    const sub = financeData.subscription;
    const expirationDate = sub.is_trial && sub.expiration_trial
      ? new Date(sub.expiration_trial)
      : sub.next_renewal
        ? new Date(sub.next_renewal)
        : null;

    const daysUntilExpiry = expirationDate
      ? Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      ...sub,
      renewalDateFormatted: expirationDate?.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
      planValueFormatted: sub.plan_value
        ? `R$ ${(sub.plan_value / 100).toFixed(2).replace('.', ',')}`
        : 'R$ 0,00',
      daysUntilExpiry,
    };
  }, [financeData?.subscription]);

  const formattedInvoices = useMemo(() => {
    if (!financeData?.invoices) return [];

    return financeData.invoices.map(invoice => ({
      ...invoice,
      dateFormatted: new Date(invoice.created_at).toLocaleDateString('pt-BR'),
      amountFormatted: `R$ ${(invoice.value / 100).toFixed(2).replace('.', ',')}`,
      statusLabel: invoice.status === 'paid' ? 'Pago' : 'Pendente',
    }));
  }, [financeData?.invoices]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="alert alert-error">
          <span>Erro ao carregar dados financeiros. Tente novamente.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Active Subscription Card */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          Assinatura Atual
        </h3>
        <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden">

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-slate-800">
                {formattedSubscription?.plan_name || 'Plano Free'}
              </h4>
              <p className="text-slate-500 text-sm mt-1">
                {formattedSubscription?.is_expired ? (
                  <span className="text-red-600 font-semibold">Expirado</span>
                ) : formattedSubscription?.daysUntilExpiry !== null && formattedSubscription?.daysUntilExpiry !== undefined ? (
                  <>
                    {formattedSubscription?.is_trial ? 'Período de teste' : 'Ativo'} - Expira em <span className="text-orange-600 font-semibold">{formattedSubscription.daysUntilExpiry} dias</span>
                  </>
                ) : (
                  'Ativo'
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                {formattedSubscription?.renewalDateFormatted && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{formattedSubscription.is_trial ? 'Expiração' : 'Renovação'}: <strong>{formattedSubscription.renewalDateFormatted}</strong></span>
                  </div>
                )}
                {formattedSubscription?.is_trial ?
                  (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Período de teste</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>Valor: <strong>{formattedSubscription?.planValueFormatted || 'R$ 0,00'}</strong>/mês</span>
                    </div>
                  )}
                {formattedSubscription?.canceled_at && (
                  <div className="flex items-center gap-2 text-red-600 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Cancelamento agendado</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[180px]">
              <button className="btn btn-primary btn-sm bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] opacity-80 text-white text-xs font-bold rounded-full transition-colors hidden sm:block">
                {formattedSubscription?.is_trial ? 'Contratar Assinatura' : 'Fazer Upgrade'}
              </button>
              {!formattedSubscription?.is_trial && !formattedSubscription?.canceled_at && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="btn text-red-600 w-full bg-white border border-red-200 hover:bg-slate-50 font-medium py-2 px-4 transition-colors"
                >
                  Cancelar Assinatura
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Method */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Método de Pagamento</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
            {financeData?.paymentMethod ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {financeData.paymentMethod.brand} final {financeData.paymentMethod.card_mask?.slice(-4)}
                    </p>
                    <p className="text-xs text-slate-500">Expira em {financeData.paymentMethod.expiration_date}</p>
                  </div>
                </div>
                <button className="text-brand-600 text-sm font-medium hover:underline">Alterar</button>
              </>
            ) : (
              <p className="text-sm text-slate-500">Nenhum cartão cadastrado</p>
            )}
          </div>
        </section>

        {/* Billing Contact */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Dados de Cobrança</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">{financeData?.billingInfo.name}</p>
              <p className="text-xs text-slate-500">CPF/CNPJ: {financeData?.billingInfo.cpf_cnpj}</p>
              {financeData?.billingInfo.street && (
                <p className="text-xs text-slate-500">
                  {financeData.billingInfo.street}, {financeData.billingInfo.house_number} - {financeData.billingInfo.city}/{financeData.billingInfo.state}
                </p>
              )}
            </div>
            <button className="text-brand-600 text-sm font-medium hover:underline">Editar</button>
          </div>
        </section>
      </div>

      {/* Invoice History */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico de Faturas</h3>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Fatura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formattedInvoices.length > 0 ? (
                  formattedInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{invoice.dateFormatted}</td>
                      <td className="px-6 py-4">{invoice.plan_name}</td>
                      <td className="px-6 py-4">{invoice.amountFormatted}</td>
                      <td className="px-6 py-4 text-center">
                        {invoice.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            <CheckCircle className="w-3 h-3" /> Pago
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="inline-flex items-center gap-1 text-slate-400 hover:text-brand-600 transition-colors">
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma fatura encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {formattedInvoices.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500">
              Mostrando as últimas {formattedInvoices.length} faturas. <button className="text-brand-600 hover:underline">Ver todas</button>
            </div>
          )}
        </div>
      </section>

      {formattedSubscription?.id && (
        <CancelSubscriptionModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          subscriptionId={formattedSubscription.id}
          renewalDate={formattedSubscription.renewalDateFormatted || 'o fim do período'}
        />
      )}
    </div>
  );
};
