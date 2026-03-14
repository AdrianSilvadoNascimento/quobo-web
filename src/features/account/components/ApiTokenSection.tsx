import React, { useState, useEffect, useCallback } from 'react';
import { Key, Eye, EyeOff, Copy, Trash2, Plus, Check, AlertTriangle } from 'lucide-react';
import { integrationApi } from '../services/integration.service';
import type { ApiToken } from '../services/integration.service';
import { Button } from '@/components/ui';

export const ApiTokenSection: React.FC = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [showNewTokenModal, setShowNewTokenModal] = useState(false);
  const [newRawToken, setNewRawToken] = useState<string | null>(null);
  const [revealedTokens, setRevealedTokens] = useState<Record<string, string>>({});
  const [revealLoading, setRevealLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    try {
      const data = await integrationApi.getTokens();
      setTokens(data);
    } catch (err) {
      console.error('Failed to load tokens:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const result = await integrationApi.createToken(newTokenName || undefined);
      setNewRawToken(result.rawToken);
      setNewTokenName('');
      await loadTokens();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao gerar token');
    } finally {
      setCreating(false);
    }
  };

  const handleReveal = async (tokenId: string) => {
    if (revealedTokens[tokenId]) {
      // Toggle off
      setRevealedTokens((prev) => {
        const copy = { ...prev };
        delete copy[tokenId];
        return copy;
      });
      return;
    }

    setRevealLoading(tokenId);
    try {
      const raw = await integrationApi.revealToken(tokenId);
      setRevealedTokens((prev) => ({ ...prev, [tokenId]: raw }));
      // Auto-hide after 30s
      setTimeout(() => {
        setRevealedTokens((prev) => {
          const copy = { ...prev };
          delete copy[tokenId];
          return copy;
        });
      }, 30000);
    } catch (err) {
      console.error('Failed to reveal token:', err);
    } finally {
      setRevealLoading(null);
    }
  };

  const handleCopy = async (tokenId: string) => {
    try {
      let raw = revealedTokens[tokenId];
      if (!raw) {
        raw = await integrationApi.revealToken(tokenId);
      }
      await navigator.clipboard.writeText(raw);
      setCopiedId(tokenId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  const handleCopyNewToken = async () => {
    if (!newRawToken) return;
    try {
      await navigator.clipboard.writeText(newRawToken);
      setCopiedId('new');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy new token:', err);
    }
  };

  const handleRevoke = async (tokenId: string) => {
    try {
      await integrationApi.revokeToken(tokenId);
      setDeleteConfirm(null);
      await loadTokens();
    } catch (err) {
      console.error('Failed to revoke token:', err);
    }
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
            <Key className="w-5 h-5 text-brand-600" />
            Tokens de API
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Use tokens de API para acessar seus dados programaticamente.
          </p>
        </div>
        <Button
          variant='primary'
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowNewTokenModal(true)}
        >
          Gerar Token
        </Button>
      </div>

      {/* Token List */}
      {tokens.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum token de API criado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.id}
              className={`border rounded-lg p-4 transition-colors ${token.is_active
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-100 bg-slate-50 opacity-60'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">{token.name}</span>
                    {!token.is_active && (
                      <span className="badge badge-ghost badge-sm">Inativo</span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-sm text-slate-500 truncate">
                    {revealedTokens[token.id] || token.masked_token}
                  </div>
                  {token.last_used_at && (
                    <div className="mt-1 text-xs text-slate-400">
                      Último uso: {new Date(token.last_used_at).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    className="btn btn-ghost btn-sm btn-square tooltip tooltip-bottom"
                    data-tip={revealedTokens[token.id] ? 'Ocultar' : 'Visualizar'}
                    onClick={() => handleReveal(token.id)}
                    disabled={revealLoading === token.id}
                  >
                    {revealLoading === token.id ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : revealedTokens[token.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square tooltip tooltip-bottom"
                    data-tip="Copiar"
                    onClick={() => handleCopy(token.id)}
                  >
                    {copiedId === token.id ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error tooltip tooltip-bottom"
                    data-tip="Revogar"
                    onClick={() => setDeleteConfirm(token.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Token Modal */}
      {showNewTokenModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            {newRawToken ? (
              <>
                <h3 className="font-bold text-lg text-success flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Token Gerado com Sucesso
                </h3>
                <div className="mt-4">
                  <div className="alert alert-warning text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Copie o token agora. Ele não será exibido novamente.</span>
                  </div>
                  <div className="mt-3 p-3 bg-slate-100 rounded-lg font-mono text-sm break-all select-all">
                    {newRawToken}
                  </div>
                  <button
                    className="btn btn-primary btn-sm mt-3 gap-2"
                    onClick={handleCopyNewToken}
                  >
                    {copiedId === 'new' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedId === 'new' ? 'Copiado!' : 'Copiar Token'}
                  </button>
                </div>
                <div className="modal-action">
                  <button
                    className="btn"
                    onClick={() => {
                      setShowNewTokenModal(false);
                      setNewRawToken(null);
                    }}
                  >
                    Fechar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold text-lg">Gerar Novo Token de API</h3>
                <div className="mt-4">
                  <label className="label">
                    <span className="label-text">Nome do Token (opcional)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Ex: Integração ERP"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                  />
                </div>
                <div className="modal-action">
                  <button className="btn" onClick={() => setShowNewTokenModal(false)}>
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating && <span className="loading loading-spinner loading-xs"></span>}
                    Gerar
                  </button>
                </div>
              </>
            )}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => { setShowNewTokenModal(false); setNewRawToken(null); }}>close</button>
          </form>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Revogar Token</h3>
            <p className="py-4 text-slate-600">
              Tem certeza que deseja revogar este token? Todas as integrações que usam este token deixarão de funcionar imediatamente.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn btn-error" onClick={() => handleRevoke(deleteConfirm)}>
                Revogar
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
