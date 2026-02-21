import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, AlertCircle, Clock, XCircle, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Empty from '@/components/ui/Empty';
import type { ItemAuditModel } from '../types/audit.model';
import { AuditStockStatus, AuditStockType } from '../types/audit.model';

interface InfiniteScrollListProps {
  audits: ItemAuditModel[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
}

export const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({
  audits,
  hasMore,
  loading,
  loadMore,
}) => {
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, loadMore]);

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

  const getTypeLabel = (type: AuditStockType) => {
    return type === AuditStockType.CYCLIC ? 'Cíclica' : 'Total (Inventário)';
  };

  const calculateProgress = (audit: ItemAuditModel) => {
    if (!audit.items || audit.items.length === 0) return 0;
    const counted = audit.counted_items?.length || 0;
    return Math.round((counted / audit.items.length) * 100);
  };

  if (loading && audits.length === 0) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-brand-600"></span>
          <p className="text-slate-500 text-sm font-medium">Buscando auditorias...</p>
        </div>
      </div>
    );
  }

  if (audits.length === 0 && !loading) {
    return (
      <Empty
        icon={<ClipboardCheck className="w-12 h-12 text-slate-400" />}
        description="Nenhuma auditoria encontrada."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase">
              <th className="font-semibold py-4">Código</th>
              <th className="font-semibold py-4">Tipo</th>
              <th className="font-semibold py-4">Status</th>
              <th className="font-semibold py-4">Progresso</th>
              <th className="font-semibold py-4">Data Início</th>
              <th className="font-semibold py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {audits.map((audit) => {
              const progress = calculateProgress(audit);
              const totalItems = audit.items?.length || 0;
              const countedItems = audit.counted_items?.length || 0;

              return (
                <tr key={audit.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/audits/${audit.id}`)}>
                  <td className="py-4">
                    <div className="font-medium text-slate-800">{audit.code}</div>
                    <div className="text-xs text-slate-500">Criado por {audit.responsible?.name}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${audit.type === AuditStockType.CYCLIC ? 'bg-purple-500' : 'bg-blue-500'}`} />
                      <span className="font-medium text-slate-700">{getTypeLabel(audit.type)}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    {getStatusBadge(audit.status)}
                  </td>
                  <td className="py-4 w-48">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-700">{progress}%</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{countedItems}/{totalItems}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {format(new Date(audit.started_at || audit.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button className="btn btn-ghost btn-sm btn-square">
                      <span className="text-slate-400 text-lg">›</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Loading Sentinel */}
        <div ref={observerTarget} className="h-10 flex items-center justify-center p-4">
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              Carregando mais auditorias...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
