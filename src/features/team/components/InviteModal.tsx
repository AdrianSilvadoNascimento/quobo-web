import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AccountUserRole, AccountUserType } from '../types/team.types';
import type { CreateInviteData } from '../types/team.types';
import { Button } from '@/components/ui';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInviteData) => Promise<any>;
  isLoading?: boolean;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AccountUserRole>(AccountUserRole.SELLER);
  const [type, setType] = useState<AccountUserType>(AccountUserType.USER);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor, informe o email.');
      return;
    }

    try {
      await onSubmit({ email, role, type });
      onClose();
      setEmail('');
      setRole(AccountUserRole.SELLER);
      setType(AccountUserType.USER);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao enviar convite');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Convidar Novo Membro</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@empresa.com"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Função (Role)
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as AccountUserRole)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  disabled={isLoading}
                >
                  <option value={AccountUserRole.SELLER}>Vendedor</option>
                  <option value={AccountUserRole.CASHIER}>Caixa</option>
                  <option value={AccountUserRole.STOCKIST}>Estoquista</option>
                  <option value={AccountUserRole.STORE_MANAGER}>Gerente</option>
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Acesso
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountUserType)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  disabled={isLoading}
                >
                  <option value={AccountUserType.USER}>Usuário</option>
                  <option value={AccountUserType.ADMIN}>Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Enviar Convite
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
