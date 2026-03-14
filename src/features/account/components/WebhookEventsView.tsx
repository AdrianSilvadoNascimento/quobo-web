import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Copy, Check, Filter, X, RefreshCw, Activity, Terminal, Calendar, AlertCircle, Clock, Link2, Globe } from 'lucide-react';
import { integrationApi } from '../services/integration.service';
import type { WebhookEndpoint, WebhookEvent } from '../services/integration.service';

const STATUS_STYLES: Record<string, { bg: string, text: string, border: string, icon: any, label: string }> = {
  DELIVERED: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', icon: Check, label: 'Entregue' },
  PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', icon: Clock, label: 'Pendente' },
  FAILED: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20', icon: X, label: 'Falhou' },
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

  useEffect(() => {
    integrationApi.getEndpoints().then(setEndpoints).catch(console.error);
  }, []);

  useEffect(() => {
    loadEvents(true);
  }, [filterEndpointId]);

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
    <div className="drawer drawer-end">
      <input
        id={DRAWER_ID}
        type="checkbox"
        className="drawer-toggle"
        checked={!!selectedEvent}
        onChange={() => { }}
      />
      <div className="drawer-content space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header section with glassmorphism */}
        <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl border border-white/80 p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start sm:items-center gap-5">
            <button 
              className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200" 
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
                  Logs de Webhook
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Acompanhe e depure eventos instantaneamente.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Filter className="w-4 h-4 text-indigo-400" />
              </div>
              <select
                className="w-full pl-10 pr-10 py-2.5 text-sm font-medium bg-white/80 border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none appearance-none transition-all shadow-sm hover:border-slate-300"
                value={filterEndpointId}
                onChange={(e) => setFilterEndpointId(e.target.value)}
              >
                <option value="" className="text-slate-500">Filtrar por endpoint (Todos)</option>
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.url}
                  </option>
                ))}
              </select>
              {filterEndpointId && (
                <button
                  className="absolute inset-y-0 right-2 flex items-center p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  onClick={() => setFilterEndpointId('')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              className={`p-2.5 rounded-xl border border-slate-200/60 bg-white/80 text-slate-600 shadow-sm hover:shadow hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-200 ${loading && !loadingMore ? 'opacity-70 pointer-events-none' : ''}`}
              onClick={() => loadEvents(true)}
              title="Atualizar"
            >
              <RefreshCw className={`w-5 h-5 ${loading && !loadingMore ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="relative z-0 flex-1">
        <div className="w-full">
          {loading && !loadingMore ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="p-4 bg-white/80 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">Sincronizando logs...</span>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center bg-white/60 backdrop-blur-xl border border-dashed border-slate-300 rounded-3xl group transition-all duration-300 hover:bg-white/80">
              <div className="p-5 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full mb-5 shadow-inner border border-white group-hover:scale-110 transition-transform duration-500">
                <Terminal className="w-10 h-10 text-slate-400" />
              </div>
              <h4 className="text-xl font-bold text-slate-700 mb-2">Aguardando eventos</h4>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                Nenhum evento registrado ainda. Quando suas integrações dispararem webhooks, eles aparecerão magicamente aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const style = STATUS_STYLES[event.status] || STATUS_STYLES['PENDING'];
                const StatusIcon = style.icon;
                
                return (
                  <div
                    key={event.id}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white/60 backdrop-blur-sm border border-slate-200/60 hover:border-indigo-500/30 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 overflow-hidden"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Subtle status indicator edge */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                       event.status === 'DELIVERED' ? 'bg-emerald-500' :
                       event.status === 'FAILED' ? 'bg-rose-500' : 'bg-amber-500'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <div className="flex items-center gap-5 sm:w-1/3">
                      <div className={`p-3.5 rounded-2xl border flex items-center justify-center transition-colors duration-300 ${style.bg} ${style.border} ${style.text}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-sm font-bold text-slate-800 tracking-tight truncate flex items-center gap-2">
                          {event.event_type}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                            {style.label}
                          </span>
                          {event.attempts > 1 && (
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-slate-200/50">
                              {event.attempts} tentativas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:w-1/3 text-slate-500 min-w-0">
                      <Link2 className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      <span className="truncate text-xs font-mono font-medium group-hover:text-slate-700 transition-colors" title={event.endpoint?.url}>
                        {event.endpoint?.url || '-'}
                      </span>
                    </div>

                    <div className="flex items-center sm:justify-end gap-2.5 text-slate-400 sm:w-1/4">
                      <Calendar className="w-4 h-4 shrink-0 group-hover:text-indigo-400 transition-colors" />
                      <span className="text-sm font-semibold group-hover:text-slate-700 transition-colors">
                        {new Date(event.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={observerRef} className="h-4" />
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm text-indigo-600 text-sm font-semibold animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin" /> 
                    <span>Carregando eventos antigos...</span>
                  </div>
                </div>
              )}
              {!nextCursor && events.length > 0 && (
                <div className="text-center py-8 text-sm font-semibold text-slate-400 flex items-center justify-center gap-2 before:h-px before:flex-1 before:bg-gradient-to-r before:from-transparent before:to-slate-200 after:h-px after:flex-1 after:bg-gradient-to-l after:from-transparent after:to-slate-200">
                  <span className="px-6 py-2 bg-slate-50/50 rounded-full border border-slate-100/50 backdrop-blur-sm">Você chegou ao fim do histórico</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Side (Event Detail) using createPortal to escape parent boundaries */}
      {selectedEvent && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative bg-slate-50/95 backdrop-blur-3xl h-[100dvh] w-[100vw] sm:w-[650px] border-l border-white/50 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ease-out">
            <div className="px-8 py-6 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-2xl shadow-md text-white ${
                      selectedEvent.status === 'DELIVERED' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                      selectedEvent.status === 'FAILED' ? 'bg-gradient-to-br from-rose-400 to-rose-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'
                    }`}>
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Inspeção de Payload</h3>
                      <p className="text-[11px] text-slate-500 font-mono mt-1 font-semibold bg-slate-100 inline-block px-2 py-0.5 rounded border border-slate-200/60">
                        {selectedEvent.id}
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-rose-500 hover:border-rose-200 hover:-translate-y-0.5 transition-all duration-200"
                    onClick={() => setSelectedEvent(null)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 pb-16">
                  {/* Status Badges Header */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 hover:border-indigo-100 hover:shadow-md transition-all group">
                      <span className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        <Activity className="w-4 h-4" />
                        Status de Entrega
                      </span>
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border shadow-sm ${STATUS_STYLES[selectedEvent.status]?.bg} ${STATUS_STYLES[selectedEvent.status]?.text} ${STATUS_STYLES[selectedEvent.status]?.border}`}>
                        {STATUS_STYLES[selectedEvent.status]?.label || selectedEvent.status}
                      </span>
                      {selectedEvent.error_message && (
                        <div className="mt-5 flex items-start gap-3 text-rose-600 bg-rose-50/50 p-4 rounded-2xl text-xs font-semibold border border-rose-100/50 shadow-inner">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="break-words leading-relaxed">{selectedEvent.error_message}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 hover:border-indigo-100 hover:shadow-md transition-all group">
                      <span className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        <Calendar className="w-4 h-4" />
                        Registro do Evento
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xl font-black text-slate-800 tracking-tight">
                          {new Date(selectedEvent.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">
                          {new Date(selectedEvent.created_at).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        Detalhes da Transação
                      </h4>
                    </div>
                    <div className="divide-y divide-slate-100 text-sm">
                      <div className="flex items-center justify-between p-5 px-6 hover:bg-slate-50/50 transition-colors">
                        <span className="font-semibold text-slate-500">Evento</span>
                        <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-100">
                          {selectedEvent.event_type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-5 px-6 hover:bg-slate-50/50 transition-colors">
                        <span className="font-semibold text-slate-500">HTTP Status</span>
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                          {selectedEvent.response_status ? (
                            <span className={selectedEvent.response_status >= 200 && selectedEvent.response_status < 300 ? 'text-emerald-600' : 'text-rose-600'}>
                              {selectedEvent.response_status}
                            </span>
                          ) : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-5 px-6 hover:bg-slate-50/50 transition-colors">
                        <span className="font-semibold text-slate-500">Tentativas de Envio</span>
                        <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                          {selectedEvent.attempts} <span className="text-slate-400 font-semibold">/ {selectedEvent.max_attempts}</span>
                        </span>
                      </div>
                      {selectedEvent.delivered_at && (
                        <div className="flex items-center justify-between p-5 px-6 hover:bg-slate-50/50 transition-colors">
                          <span className="font-semibold text-slate-500">Entregue com Sucesso</span>
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm text-right">
                            {new Date(selectedEvent.delivered_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* JSON Payload */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-2">
                      <h4 className="flex items-center gap-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <Terminal className="w-5 h-5 text-indigo-400" />
                        Payload Enviado
                      </h4>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm border hover:-translate-y-0.5 ${
                          copiedJson 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-500/10' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-800'
                        }`}
                        onClick={handleCopyJson}
                      >
                        {copiedJson ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copiedJson ? 'Copiado!' : 'Copiar JSON'}
                      </button>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-indigo-900 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 -z-10"></div>
                      <div className="bg-[#0b1121] rounded-[2rem] p-7 overflow-auto shadow-2xl relative border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-800/80 pb-5">
                          <div className="flex gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-rose-500/90 shadow-sm"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-amber-500/90 shadow-sm"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 shadow-sm"></div>
                          </div>
                          <div className="ml-3 font-mono text-[11px] text-slate-400 font-semibold tracking-wide">request.json</div>
                        </div>
                        <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap break-words lowercase-keys leading-relaxed selection:bg-indigo-500/40">
                          {JSON.stringify(selectedEvent.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Response body */}
                  {selectedEvent.response_body && (
                    <div className="space-y-4 pt-6 border-t border-slate-200/50">
                      <div className="flex items-center gap-2.5 ml-2">
                        <Globe className="w-5 h-5 text-indigo-400" />
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Resposta do Servidor
                        </h4>
                      </div>
                      <div className="bg-[#0f172a] rounded-[2rem] p-7 overflow-auto shadow-inner border border-slate-800 relative group">
                        <div className="absolute top-0 right-0 py-1.5 px-4 bg-slate-800 text-slate-400 text-[10px] font-mono font-bold tracking-widest uppercase rounded-bl-2xl rounded-tr-[2rem] border-b border-l border-slate-700/50 transition-colors group-hover:bg-slate-700">response body</div>
                        <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap break-words leading-relaxed selection:bg-indigo-500/40 mt-2">
                          {selectedEvent.response_body}
                        </pre>
                      </div>
                    </div>
                  )}

              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};
