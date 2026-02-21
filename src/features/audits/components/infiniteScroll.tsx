import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ClipboardCheck } from 'lucide-react';
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
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Em Aberto
          </span>
        );
      case AuditStockStatus.PAUSED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Em Andamento
          </span>
        );
      case AuditStockStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Concluída
          </span>
        );
      case AuditStockStatus.CANCELED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Cancelada
          </span>
        );
      default:
        return <span className="text-slate-400 capitalize">{(status as string).toLowerCase()}</span>;
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
              <th className="px-6 py-4 font-semibold">Código</th>
              <th className="px-6 py-4 font-semibold">Tipo</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold">Progresso</th>
              <th className="px-6 py-4 font-semibold text-right">Data Início</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {audits.map((audit) => {
              const progress = calculateProgress(audit);
              const totalItems = audit.items?.length || 0;
              const countedItems = audit.counted_items?.length || 0;

              return (
                <tr key={audit.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/audits/${audit.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{audit.code}</div>
                    <div className="text-xs text-slate-500">Criado por {audit.responsible?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${audit.type === AuditStockType.CYCLIC ? 'bg-purple-500' : 'bg-blue-500'}`} />
                      <span className="font-medium text-slate-700">{getTypeLabel(audit.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(audit.status)}
                  </td>
                  <td className="px-6 py-4 w-48">
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-600 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {format(new Date(audit.started_at || audit.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
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
