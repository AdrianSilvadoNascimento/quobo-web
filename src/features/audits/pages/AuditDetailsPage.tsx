import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Smartphone, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { audit_service } from '../services/audit.service';
import type { ItemAuditModel } from '../types/audit.model';
import { AuditStockStatus, AuditStockType } from '../types/audit.model';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AuditQRCode } from '../components/AuditQRCode';

export const AuditDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<ItemAuditModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAudit = async () => {
      if (!id) return;
      try {
        const data = await audit_service.getAudit(id);
        setAudit(data);
      } catch (error) {
        console.error('Failed to load audit', error);
        // Fallback for demo if backend not ready:
        // navigate('/audits'); 
      } finally {
        setLoading(false);
      }
    };

    loadAudit();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-brand-600"></span>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold">Auditoria não encontrada</h2>
        <button onClick={() => navigate('/audits')} className="btn btn-link text-brand-600 mt-4">
          Voltar para lista
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: AuditStockStatus) => {
    switch (status) {
      case AuditStockStatus.STARTED:
        return <span className="badge badge-info gap-1 text-xs font-medium"><Clock className="w-3 h-3" /> Em Aberto</span>;
      case AuditStockStatus.PAUSED:
        return <span className="badge badge-warning gap-1 text-xs font-medium"><AlertCircle className="w-3 h-3" /> Em Andamento</span>;
      case AuditStockStatus.COMPLETED:
        return <span className="badge badge-success gap-1 text-xs font-medium text-white"><CheckCircle2 className="w-3 h-3" /> Concluída</span>;
      case AuditStockStatus.CANCELED:
        return <span className="badge badge-error gap-1 text-xs font-medium text-white"><XCircle className="w-3 h-3" /> Cancelada</span>;
      default:
        return <span className="badge badge-ghost">{status}</span>;
    }
  };

  const calculateProgress = () => {
    if (!audit.items || audit.items.length === 0) return 0;
    const counted = audit.counted_items?.length || 0;
    return Math.round((counted / audit.items.length) * 100);
  };

  const progress = calculateProgress();
  const totalItems = audit.items?.length || 0;
  const countedItems = audit.counted_items?.length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/audits')}
          className="cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{audit.code}</h1>
            {getStatusBadge(audit.status)}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(audit.started_at || audit.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Criado por {audit.responsible?.name || 'Desconhecido'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-6">Progresso da Contagem</h3>

            <div className="flex items-end justify-between mb-2">
              <span className="text-4xl font-bold text-brand-600">{progress}%</span>
              <span className="text-slate-500 font-medium mb-1">{countedItems} de {totalItems} itens</span>
            </div>

            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tipo</span>
                <span className="font-medium text-slate-700">
                  {audit.type === AuditStockType.CYCLIC ? 'Cíclica' : 'Total'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Participantes</span>
                <div className="flex -space-x-2">
                  {audit.participants_data && audit.participants_data.length > 0 ? (
                    audit.participants_data.map((participant) => (
                      <div
                        key={participant.id}
                        className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600"
                        title={participant.name}
                      >
                        {participant.name.substring(0, 2).toUpperCase()}
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">-</span>
                  )}
                </div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Plataforma</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  {audit.platform === 'mobile' ? (
                    <><Smartphone className="w-3 h-3" /> Mobile</>
                  ) : (
                    <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> Web</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Report Placeholder (if completed) */}
          {audit.status === AuditStockStatus.COMPLETED && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Relatório Final</h3>
              <p className="text-slate-500 text-sm">
                Esta auditoria foi concluída. Você pode visualizar o relatório completo de discrepâncias e ajustes realizados.
              </p>
              <button className="btn btn-outline btn-sm mt-4">Ver Relatório Completo</button>
            </div>
          )}
        </div>

        {/* Right Column: CTA / QR Code */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

            <div className="relative z-10 flex flex-col items-center">
              <AuditQRCode auditId={audit.id} size={200} showDownload />

              <h3 className="font-bold text-lg mb-2">Continue pelo App</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                A contagem física deve ser realizada através do aplicativo móvel. Escaneie o QR Code para abrir a auditoria.
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/10 px-3 py-1.5 rounded-full">
                <Smartphone className="w-3 h-3" />
                <span>Disponível para Android</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
