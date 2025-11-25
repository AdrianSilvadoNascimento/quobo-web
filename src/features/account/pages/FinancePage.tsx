import React from 'react';
import { CreditCard, Download, Clock, CheckCircle, Calendar } from 'lucide-react';

export const FinancePage: React.FC = () => {
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
              <h4 className="text-xl font-bold text-slate-800">Plano Free</h4>
              <p className="text-slate-500 text-sm mt-1">
                Período de teste - Expira em <span className="text-orange-600 font-semibold">2 dias</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Renovação: <strong>31/12/2029</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>Valor: <strong>R$ 0,00</strong>/mês</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[180px]">
              <button className="btn btn-primary btn-sm bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] opacity-80 text-white text-xs font-bold rounded-full transition-colors hidden sm:block">
                Fazer Upgrade
              </button>
              <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                Cancelar Assinatura
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Method */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Método de Pagamento</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                <CreditCard className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Mastercard final 8832</p>
                <p className="text-xs text-slate-500">Expira em 10/2028</p>
              </div>
            </div>
            <button className="text-brand-600 text-sm font-medium hover:underline">Alterar</button>
          </div>
        </section>

        {/* Billing Contact */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Dados de Cobrança</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Quobo Tecnologia Ltda</p>
              <p className="text-xs text-slate-500">CNPJ: 00.000.000/0001-00</p>
              <p className="text-xs text-slate-500">Rua da Tecnologia, 123 - SP</p>
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
                {[
                  { date: '17/10/2025', plan: 'Plano Free (Trial)', amount: 'R$ 0,00', status: 'paid' },
                  { date: '17/09/2025', plan: 'Plano Bronze', amount: 'R$ 29,90', status: 'paid' },
                  { date: '17/08/2025', plan: 'Plano Bronze', amount: 'R$ 29,90', status: 'pending' },
                ].map((invoice, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{invoice.date}</td>
                    <td className="px-6 py-4">{invoice.plan}</td>
                    <td className="px-6 py-4">{invoice.amount}</td>
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
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500">
            Mostrando as últimas 3 faturas. <button className="text-brand-600 hover:underline">Ver todas</button>
          </div>
        </div>
      </section>
    </div>
  );
};
