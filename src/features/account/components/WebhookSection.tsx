import React, { useState, useEffect, useCallback } from 'react';
import { Webhook, Plus, Trash2, Edit3, ExternalLink } from 'lucide-react';
import { integrationApi } from '../services/integration.service';
import type { WebhookEndpoint } from '../services/integration.service';
import { Button } from '@/components/ui';

const EVENT_LABELS: Record<string, string> = {
  'item.created': 'Item Criado',
  'item.updated': 'Item Atualizado',
  'item.deleted': 'Item Excluído',
  'category.created': 'Categoria Criada',
  'category.updated': 'Categoria Atualizada',
  'category.deleted': 'Categoria Excluída',
  'customer.created': 'Cliente Criado',
  'customer.updated': 'Cliente Atualizado',
  'customer.deleted': 'Cliente Excluído',
  'movementation.created': 'Movimentação Criada',
  'supplier.created': 'Fornecedor Criado',
  'supplier.updated': 'Fornecedor Atualizado',
  'supplier.deleted': 'Fornecedor Excluído',
  'order.created': 'Pedido Criado',
};

interface WebhookSectionProps {
  onViewEvents: () => void;
}

export const WebhookSection: React.FC<WebhookSectionProps> = ({ onViewEvents }) => {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<WebhookEndpoint | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [eps, events] = await Promise.all([
        integrationApi.getEndpoints(),
        integrationApi.getAvailableEvents(),
      ]);
      setEndpoints(eps);
      setAvailableEvents(events);
    } catch (err) {
      console.error('Failed to load webhooks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async () => {
    if (!formUrl.trim() || formEvents.length === 0) return;
    setSubmitting(true);
    try {
      await integrationApi.createEndpoint(formUrl.trim(), formEvents);
      setShowAddModal(false);
      setFormUrl('');
      setFormEvents([]);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao adicionar webhook');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingEndpoint || formEvents.length === 0) return;
    setSubmitting(true);
    try {
      await integrationApi.updateEndpoint(editingEndpoint.id, { events: formEvents });
      setEditingEndpoint(null);
      setFormEvents([]);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao atualizar webhook');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (endpointId: string) => {
    try {
      await integrationApi.deleteEndpoint(endpointId);
      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete webhook:', err);
    }
  };

  const toggleEvent = (event: string) => {
    setFormEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const openEdit = (endpoint: WebhookEndpoint) => {
    setEditingEndpoint(endpoint);
    setFormEvents(endpoint.events);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Webhook className="w-5 h-5 text-brand-600" />
            Webhooks
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Receba notificações em tempo real quando eventos ocorrerem.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant='secondary' icon={<ExternalLink className="w-4 h-4" />} onClick={onViewEvents}>
            Ver Eventos
          </Button>
          <Button
            variant='primary'
            onClick={() => {
              setShowAddModal(true);
              setFormUrl('');
              setFormEvents([]);
            }}
          >
            <Plus className="w-4 h-4" />
            Adicionar URL
          </Button>
        </div>
      </div>

      {/* Endpoint List */}
      {endpoints.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Webhook className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum webhook configurado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <div
              key={ep.id}
              className={`border rounded-lg p-4 transition-colors ${ep.is_active
                ? 'border-slate-200 bg-white'
                : 'border-slate-100 bg-slate-50 opacity-60'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-slate-700 truncate">{ep.url}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ep.events.map((event) => (
                      <span key={event} className="badge badge-sm badge-outline badge-primary">
                        {EVENT_LABELS[event] || event}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Criado em: {new Date(ep.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    className="btn btn-ghost btn-sm btn-square tooltip tooltip-bottom"
                    data-tip="Editar eventos"
                    onClick={() => openEdit(ep)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error tooltip tooltip-bottom"
                    data-tip="Remover"
                    onClick={() => setDeleteConfirm(ep.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || editingEndpoint) && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg">
              {editingEndpoint ? 'Editar Eventos do Webhook' : 'Adicionar Webhook'}
            </h3>

            {!editingEndpoint && (
              <div className="mt-4">
                <label className="label">
                  <span className="label-text font-medium">URL do Webhook</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered w-full"
                  placeholder="https://exemplo.com/webhook"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                />
              </div>
            )}

            {editingEndpoint && (
              <div className="mt-2 p-2 bg-slate-50 rounded font-mono text-sm text-slate-600 truncate">
                {editingEndpoint.url}
              </div>
            )}

            <div className="mt-4">
              <label className="label">
                <span className="label-text font-medium">Eventos</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {availableEvents.map((event) => (
                  <label
                    key={event}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${formEvents.includes(event)
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={formEvents.includes(event)}
                      onChange={() => toggleEvent(event)}
                    />
                    <span className="text-sm">{EVENT_LABELS[event] || event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-action">
              <Button
                variant='secondary'
                disabled={submitting}
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEndpoint(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant='primary'
                onClick={editingEndpoint ? handleEdit : handleAdd}
                isLoading={submitting}
                disabled={
                  submitting ||
                  formEvents.length === 0 ||
                  (!editingEndpoint && !formUrl.trim())
                }
              >
                {editingEndpoint ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingEndpoint(null);
              }}
            >
              close
            </button>
          </form>
        </dialog>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Remover Webhook</h3>
            <p className="py-4 text-slate-600">
              Tem certeza que deseja remover este webhook? Todos os eventos de histórico associados a esta URL serão excluídos permanentemente.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn btn-error" onClick={() => handleDelete(deleteConfirm)}>
                Remover
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setDeleteConfirm(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};
