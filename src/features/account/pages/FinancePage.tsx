import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Download, Clock, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { accountApi } from '@/services/accountApi';
import { CancelSubscriptionModal } from '../components/CancelSubscriptionModal';
import { planService } from '@/features/checkout/services/plan.service';

import { useSubscriptionSocket } from '@/hooks/useSubscriptionSocket';
import { Button } from '@/components/ui';

export const FinancePage: React.FC = () => {
  const { account } = useAuth();
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [retryingInvoice, setRetryingInvoice] = React.useState<string | null>(null);
  const accountId = account?.id;

  const { lastUpdate } = useSubscriptionSocket(accountId);

  const { data: financeData, isLoading, error, refetch } = useQuery({
    queryKey: ['finance'],
    queryFn: () => accountApi.getFinanceData(),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (lastUpdate) {
      refetch();
    }
  }, [lastUpdate, refetch]);

  const formattedSubscription = useMemo(() => {
    if (!financeData?.subscription) return null;

    const sub = financeData.subscription;
    const isCanceled = !!sub.canceled_at;

    const relevantDate = sub.is_trial && sub.expiration_trial
      ? new Date(sub.expiration_trial)
      : sub.next_renewal
        ? new Date(sub.next_renewal)
        : null;

    const daysUntilRelevantDate = relevantDate
      ? Math.ceil((relevantDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const billingPeriod = (sub as any).plan?.billing_period || 'MONTHLY';

    return {
      ...sub,
      isCanceled,
      relevantDateFormatted: relevantDate?.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
      planValueFormatted: sub.plan_value
        ? `R$ ${(sub.plan_value / 100).toFixed(2).replace('.', ',')}`
        : 'R$ 0,00',
      daysUntilRelevantDate,
      billing_period: billingPeriod,
      hasPendingPayment: financeData?.invoices?.length > 0 && financeData.invoices[0]?.status !== 'paid',
    };
  }, [financeData?.subscription, financeData?.invoices]);

  const formattedInvoices = useMemo(() => {
    if (!financeData?.invoices) return [];

    return financeData.invoices.map(invoice => ({
      ...invoice,
      dateFormatted: new Date(invoice.created_at).toLocaleDateString('pt-BR'),
      amountFormatted: `R$ ${(invoice.value / 100).toFixed(2).replace('.', ',')}`,
      statusLabel: invoice.status === 'paid' ? 'Pago' : 'Pendente',
    }));
  }, [financeData?.invoices]);

  const handleViewPlans = () => {
    window.location.href = '/plans';
  };

  const handleUpdateCard = async () => {
    try {
      const { url } = await planService.createPortalSession(window.location.href);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Erro ao redirecionar para o portal:', error);
      alert('Não foi possível abrir o portal de pagamento. Tente novamente mais tarde.');
    }
  };

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
          <span className="text-white">Erro ao carregar dados financeiros. Tente novamente.</span>
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
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${formattedSubscription?.isCanceled ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
              {formattedSubscription?.isCanceled ? (
                <Clock className="w-8 h-8" />
              ) : (
                <span className="text-2xl">⚡</span>
              )}
            </div>

            <div className="flex-1">
              <h4 className="text-xl font-bold text-slate-800">
                {formattedSubscription?.plan_name || 'Plano Free'}
              </h4>

              <div className="mt-2 flex flex-col gap-1">
                <p className="text-sm font-medium">
                  Status: {' '}
                  {(formattedSubscription?.status === 'SUSPENDED' || formattedSubscription?.hasPendingPayment) ? (
                    <span className="text-red-600">Pagamento Pendente</span>
                  ) : formattedSubscription?.is_expired ? (
                    <span className="text-red-600">Expirado</span>
                  ) : formattedSubscription?.isCanceled ? (
                    <span className="text-orange-600">Cancelamento Agendado</span>
                  ) : formattedSubscription?.is_trial ? (
                    <span className="text-blue-600">Período de Teste</span>
                  ) : (
                    <span className="text-green-600">Ativo</span>
                  )}
                </p>

                {formattedSubscription?.relevantDateFormatted && (
                  <p className="text-sm text-slate-500">
                    {formattedSubscription.isCanceled
                      ? 'Acesso disponível até: '
                      : formattedSubscription.is_trial
                        ? 'Teste válido até: '
                        : (formattedSubscription.status === 'SUSPENDED' || formattedSubscription.hasPendingPayment)
                          ? 'Vencimento: '
                          : 'Próxima renovação: '}
                    <strong className="text-slate-700">{formattedSubscription.relevantDateFormatted}</strong>
                    {formattedSubscription.daysUntilRelevantDate !== null && (
                      <span className="text-xs ml-2 text-slate-400">
                        {formattedSubscription.daysUntilRelevantDate < 0
                          ? `(vencida há ${Math.abs(formattedSubscription.daysUntilRelevantDate)} dias)`
                          : `(em ${formattedSubscription.daysUntilRelevantDate} dias)`
                        }
                      </span>
                    )}
                  </p>
                )}
              </div>

              {!formattedSubscription?.is_trial && !formattedSubscription?.isCanceled && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>Valor: <strong>{formattedSubscription?.planValueFormatted || 'R$ 0,00'}</strong>/{formattedSubscription?.billing_period === 'ANNUAL' ? 'ano' : formattedSubscription?.billing_period === 'SEMI_ANNUAL' ? 'sub' : 'mês'}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              <Button
                onClick={handleViewPlans}
                variant="primary"
                className="bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] text-white font-bold rounded-lg w-full transition-transform hover:scale-[1.02]"
              >
                {formattedSubscription?.isCanceled ? 'Reativar Assinatura' : 'Ver Planos'}
              </Button>

              {!formattedSubscription?.isCanceled && !formattedSubscription?.is_expired && (
                <Button
                  onClick={() => setIsCancelModalOpen(true)}
                  variant="danger"
                  className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 hover:border-red-200 border-slate-200 w-full"
                  title="Cancelar assinatura"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Method */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Método de Pagamento</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between min-h-[100px]">
            {financeData?.paymentMethod ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                    <CreditCard className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {financeData.paymentMethod.brand} •••• {financeData.paymentMethod.card_mask?.slice(-4)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Expira em {financeData.paymentMethod.expiration_date}</p>
                  </div>
                </div>
                <Button onClick={handleUpdateCard} variant="ghost">Alterar</Button>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm border-dashed">
                    <CreditCard className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500">Nenhum cartão cadastrado</p>
                </div>
                <Button onClick={handleUpdateCard} variant="ghost">Adicionar</Button>
              </div>
            )}
          </div>
        </section>

        {/* Billing Contact */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Dados de Cobrança</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between min-h-[100px]">
            <div>
              <p className="text-sm font-semibold text-slate-800">{financeData?.billingInfo.name}</p>
              <p className="text-xs text-slate-500 mt-1">CPF/CNPJ: {financeData?.billingInfo.cpf_cnpj}</p>
              {financeData?.billingInfo.street && (
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                  {financeData.billingInfo.street}, {financeData.billingInfo.house_number}
                </p>
              )}
            </div>
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
                  <th className="px-6 py-4 text-center">Fatura</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formattedInvoices.length > 0 ? (
                  formattedInvoices.map((invoice) => (
                    <React.Fragment key={invoice.id}>
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
                        <td className="px-6 py-4 text-center">
                          <Button
                            variant='ghost'
                            onClick={() => invoice.invoice_pdf && window.open(invoice.invoice_pdf, '_blank')}
                            disabled={!invoice.invoice_pdf}
                            className="cursor-pointer inline-flex items-center gap-1 text-slate-400 hover:text-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={invoice.invoice_pdf ? 'Baixar PDF' : 'PDF não disponível'}
                            icon={<Download className="w-4 h-4" />}
                          >
                            <span className="hidden sm:inline">PDF</span>
                          </Button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {invoice.status !== 'paid' && (
                            <Button
                              variant='ghost'
                              onClick={async () => {
                                setRetryingInvoice(invoice.id);
                                try {
                                  const result = await accountApi.retryInvoicePayment(invoice.id);
                                  if (result.success) {
                                    alert(result.message);
                                    refetch();
                                  } else {
                                    alert(result.message);
                                  }
                                } catch (error) {
                                  alert('Erro ao tentar novamente');
                                } finally {
                                  setRetryingInvoice(null);
                                }
                              }}
                              disabled={retryingInvoice === invoice.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Tentar pagamento novamente"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${retryingInvoice === invoice.id ? 'animate-spin' : ''}`} />
                              <span>{retryingInvoice === invoice.id ? 'Processando...' : 'Tentar Novamente'}</span>
                            </Button>
                          )}
                        </td>
                      </tr>
                      {
                        invoice.error_message && (
                          <tr>
                            <td colSpan={6} className="px-6 py-2 bg-red-50">
                              <div className="flex items-start gap-2 text-sm text-red-700">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span><strong>Erro:</strong> {invoice.error_message}</span>
                              </div>
                            </td>
                          </tr>
                        )
                      }
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma fatura encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {formattedInvoices.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500">
              Mostrando as últimas {formattedInvoices.length} faturas.
            </div>
          )}
        </div>
      </section>

      {formattedSubscription?.id && (
        <CancelSubscriptionModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          subscriptionId={formattedSubscription.id}
          renewalDate={formattedSubscription.relevantDateFormatted || 'o fim do período'}
        />
      )}
    </div>
  );
};
