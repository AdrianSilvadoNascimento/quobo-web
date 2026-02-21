import React from 'react';
import { Mail, RefreshCw, Trash2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { InviteStatus, AccountUserRole } from '../types/team.types';
import type { Invite } from '../types/team.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button, Loader } from '@/components/ui';

interface InviteListProps {
  invites: Invite[];
  isLoading: boolean;
  onCancel: (id: string) => void;
  onResend: (id: string) => void;
  isCancelling?: boolean;
  isResending?: boolean;
  cancellingId?: string | null;
  resendingId?: string | null;
}

export const InviteList: React.FC<InviteListProps> = ({
  invites,
  isLoading,
  onCancel,
  onResend,
  isCancelling,
  isResending,
  cancellingId,
  resendingId
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader size="md" className="text-primary" />
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-900">Nenhum convite encontrado</h3>
        <p className="text-xs text-gray-500 mt-1">Envie convites para adicionar membros ao time.</p>
      </div>
    );
  }

  const getStatusBadge = (status: InviteStatus) => {
    switch (status) {
      case InviteStatus.PENDING:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Pendente</span>;
      case InviteStatus.ACCEPTED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Aceito</span>;
      case InviteStatus.EXPIRED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3" /> Expirado</span>;
      case InviteStatus.CANCELLED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800">Cancelado</span>;
      case InviteStatus.REJECTED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejeitado</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const getRoleLabel = (role: AccountUserRole) => {
    switch (role) {
      case AccountUserRole.STORE_MANAGER: return 'Gerente';
      case AccountUserRole.STOCKIST: return 'Estoquista';
      case AccountUserRole.CASHIER: return 'Caixa';
      default: return 'Vendedor';
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enviado em</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invites.map((invite) => (
            <tr key={invite.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                <div className="text-xs text-gray-500">Convidado por: {invite.invited_by?.name || 'Sistema'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getRoleLabel(invite.role)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(invite.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(invite.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {invite.status === InviteStatus.PENDING && (
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => onResend(invite.id)}
                      disabled={isResending || isCancelling}
                      className="cursor-pointer text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors tooltip tooltip-left disabled:opacity-50 disabled:cursor-not-allowed"
                      data-tip="Reenviar convite"
                      variant='ghost'
                      size='sm'
                      isLoading={resendingId === invite.id}
                      icon={<RefreshCw className="w-4 h-4" />}
                    />
                    <Button
                      onClick={() => onCancel(invite.id)}
                      disabled={isCancelling || isResending}
                      className="cursor-pointer text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors tooltip tooltip-left disabled:opacity-50 disabled:cursor-not-allowed"
                      data-tip="Cancelar convite"
                      variant='ghost'
                      size='sm'
                      isLoading={cancellingId === invite.id}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
