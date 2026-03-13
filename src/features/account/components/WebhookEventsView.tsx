import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Copy, Check, Filter, X, RefreshCw } from 'lucide-react';
import { integrationApi } from '../services/integration.service';
import type { WebhookEndpoint, WebhookEvent } from '../services/integration.service';

const STATUS_BADGE: Record<string, string> = {
  DELIVERED: 'badge-success',
  PENDING: 'badge-warning',
  FAILED: 'badge-error',
};

const STATUS_LABEL: Record<string, string> = {
  DELIVERED: 'Entregue',
  PENDING: 'Pendente',
  FAILED: 'Falhou',
};

interface WebhookEventsViewProps {
  onBack: () => void;
}

export const WebhookEventsView: React.FC<WebhookEventsViewProps> = ({ onBack }) => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filterEndpointId, setFilterEndpointId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadEvents = useCallback(
    async (reset = false) => {
      if (reset) {
        setLoading(true);
        setEvents([]);
        setNextCursor(null);
      }

      try {
        const result = await integrationApi.getEvents({
          endpoint_id: filterEndpointId || undefined,
          cursor: reset ? undefined : (nextCursor || undefined),
          take: 20,
        });

        setEvents((prev) => (reset ? result.events : [...prev, ...result.events]));
        setNextCursor(result.nextCursor);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filterEndpointId, nextCursor],
  );

  // Load endpoints for filter dropdown
  useEffect(() => {
    integrationApi.getEndpoints().then(setEndpoints).catch(console.error);
  }, []);

  // Load events on mount or filter change
  useEffect(() => {
    loadEvents(true);
  }, [filterEndpointId]);

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current || !nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          setLoadingMore(true);
          loadEvents(false);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore]);

  const handleCopyJson = async () => {
    if (!selectedEvent) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedEvent.payload, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const DRAWER_ID = 'webhook-event-drawer';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-sm btn-square" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Eventos de Webhook</h3>
            <p className="text-sm text-slate-500">
              Histórico de eventos enviados para seus webhooks.
            </p>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm gap-2"
          onClick={() => loadEvents(true)}
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          className="select select-bordered select-sm flex-1 max-w-xs"
          value={filterEndpointId}
          onChange={(e) => setFilterEndpointId(e.target.value)}
        >
          <option value="">Todas as URLs</option>
          {endpoints.map((ep) => (
            <option key={ep.id} value={ep.id}>
              {ep.url}
            </option>
          ))}
        </select>
        {filterEndpointId && (
          <button
            className="btn btn-ghost btn-xs btn-square"
            onClick={() => setFilterEndpointId('')}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* DaisyUI Drawer for event detail */}
      <div className="drawer drawer-end">
        <input
          id={DRAWER_ID}
          type="checkbox"
          className="drawer-toggle"
          checked={!!selectedEvent}
          onChange={() => {}}
        />

        <div className="drawer-content">
          {/* Events Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>Nenhum evento encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th>Evento</th>
                    <th>Status</th>
                    <th>Tentativas</th>
                    <th>URL</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="hover cursor-pointer transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <td>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                          {event.event_type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-sm ${STATUS_BADGE[event.status] || 'badge-ghost'}`}>
                          {STATUS_LABEL[event.status] || event.status}
                        </span>
                      </td>
                      <td className="text-slate-500">{event.attempts}/{event.max_attempts}</td>
                      <td className="text-slate-500 truncate max-w-[200px] text-xs font-mono">
                        {event.endpoint?.url || '-'}
                      </td>
                      <td className="text-slate-400 text-xs whitespace-nowrap">
                        {new Date(event.created_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Infinite scroll sentinel */}
              <div ref={observerRef} className="h-4" />
              {loadingMore && (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-sm text-primary"></span>
                </div>
              )}
              {!nextCursor && events.length > 0 && (
                <div className="text-center py-4 text-sm text-slate-400">
                  Todos os eventos foram carregados.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Side (Event Detail) */}
        <div className="drawer-side z-50">
          <label
            htmlFor={DRAWER_ID}
            aria-label="close sidebar"
            className="drawer-overlay"
            onClick={() => setSelectedEvent(null)}
          ></label>
          <div className="bg-white min-h-full w-[95vw] sm:w-[500px] p-6 flex flex-col">
            {selectedEvent && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Detalhes do Evento</h3>
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => setSelectedEvent(null)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Event Meta */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Tipo</span>
                    <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                      {selectedEvent.event_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Status</span>
                    <span
                      className={`badge badge-sm ${STATUS_BADGE[selectedEvent.status] || 'badge-ghost'}`}
                    >
                      {STATUS_LABEL[selectedEvent.status] || selectedEvent.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Tentativas</span>
                    <span className="text-sm">
                      {selectedEvent.attempts}/{selectedEvent.max_attempts}
                    </span>
                  </div>
                  {selectedEvent.response_status && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">HTTP Status</span>
                      <span className="text-sm font-mono">{selectedEvent.response_status}</span>
                    </div>
                  )}
                  {selectedEvent.error_message && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Erro</span>
                      <span className="text-sm text-error max-w-[250px] text-right">
                        {selectedEvent.error_message}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Data</span>
                    <span className="text-sm">
                      {new Date(selectedEvent.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {selectedEvent.delivered_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Entregue em</span>
                      <span className="text-sm">
                        {new Date(selectedEvent.delivered_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="divider text-sm text-slate-400">Payload</div>

                {/* JSON Payload */}
                <div className="flex-1 overflow-auto">
                  <div className="relative">
                    <button
                      className="btn btn-ghost btn-xs absolute top-2 right-2 gap-1"
                      onClick={handleCopyJson}
                    >
                      {copiedJson ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedJson ? 'Copiado' : 'Copiar'}
                    </button>
                    <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-mono overflow-auto max-h-[400px] whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Response body if available */}
                {selectedEvent.response_body && (
                  <>
                    <div className="divider text-sm text-slate-400 mt-4">Resposta</div>
                    <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-mono overflow-auto max-h-[200px] whitespace-pre-wrap break-words">
                      {selectedEvent.response_body}
                    </pre>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
