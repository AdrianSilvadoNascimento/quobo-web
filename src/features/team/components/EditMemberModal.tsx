import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AccountUserType, AccountUserRole } from '../types/team.types';
import type { TeamMember, UpdateMemberAccessData } from '../types/team.types';

interface EditMemberModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSubmit: (data: UpdateMemberAccessData) => Promise<void>;
  isLoading: boolean;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [type, setType] = useState<string>('');
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    if (member) {
      setType(member.type);
      setRole(member.role);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      type: type as AccountUserType,
      role: role as AccountUserRole,
    });
  };

  const isOwner = member.type === AccountUserType.OWNER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Acesso</h2>
            <p className="text-sm text-gray-500 mt-1">
              {member.name} {member.lastname}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {isOwner ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                O dono da conta não pode ter seu acesso alterado.
              </p>
            </div>
          ) : (
            <>
              {/* Tipo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Acesso
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value={AccountUserType.ADMIN}>Admin</option>
                  <option value={AccountUserType.USER}>Usuário</option>
                </select>
                <p className="text-xs text-gray-500">
                  Admin pode gerenciar membros e configurações. Usuário tem acesso limitado.
                </p>
              </div>

              {/* Função */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Função
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value={AccountUserRole.STORE_MANAGER}>Gerente</option>
                  <option value={AccountUserRole.STOCKIST}>Estoquista</option>
                  <option value={AccountUserRole.CASHIER}>Caixa</option>
                  <option value={AccountUserRole.SELLER}>Vendedor</option>
                </select>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            {!isOwner && (
              <button
                type="submit"
                disabled={isLoading}
                className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  'Salvar'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
