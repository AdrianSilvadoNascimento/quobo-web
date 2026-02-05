import React from 'react';
import { User, CheckCircle, Clock } from 'lucide-react';
import { AccountUserRole, AccountUserType } from '../types/team.types';
import type { TeamMember } from '../types/team.types';

interface UserListProps {
  members: TeamMember[];
  isLoading: boolean;
}

export const UserList: React.FC<UserListProps> = ({ members, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-900">Nenhum membro encontrado</h3>
        <p className="text-xs text-gray-500 mt-1">Sua equipe ainda não tem membros cadastrados.</p>
      </div>
    );
  }

  const getRoleBadge = (role: AccountUserRole) => {
    switch (role) {
      case AccountUserRole.STORE_MANAGER:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Gerente</span>;
      case AccountUserRole.STOCKIST:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Estoquista</span>;
      case AccountUserRole.CASHIER:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Caixa</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Vendedor</span>;
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle className="w-3 h-3" /> Ativo
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
        <Clock className="w-3 h-3" /> Inativo
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membro</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrou em</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-9 w-9">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {member.name.charAt(0).toUpperCase()}{member.lastname.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{member.name} {member.lastname}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getRoleBadge(member.role)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.type === AccountUserType.OWNER && <span className="font-semibold text-amber-600">Dono</span>}
                {member.type === AccountUserType.ADMIN && <span className="text-indigo-600">Admin</span>}
                {member.type === AccountUserType.USER && <span>Usuário</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(member.active)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(member.created_at).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
