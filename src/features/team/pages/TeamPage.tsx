import React, { useState } from 'react';
import { Plus, Users, Mail } from 'lucide-react';
import { useMembers } from '../hooks/useMembers';
import { useInvites } from '../hooks/useInvites';
import { useTeamMutations } from '../hooks/useTeamMutations';
import { UserList } from '../components/UserList';
import { InviteList } from '../components/InviteList';
import { InviteModal } from '../components/InviteModal';
import { EditMemberModal } from '../components/EditMemberModal';
import { useAuth } from '@/contexts/AuthContext';
import { AccountUserType, AccountUserRole } from '../types/team.types';
import type { TeamMember, UpdateMemberAccessData } from '../types/team.types';
import { Button } from '@/components/ui';

export const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const isAdminOrOwner =
    user?.type === AccountUserType.OWNER ||
    user?.type === AccountUserType.ADMIN ||
    user?.role === AccountUserRole.STORE_MANAGER;

  const { data: members = [], isLoading: isLoadingMembers } = useMembers();
  const { data: invites = [], isLoading: isLoadingInvites } = useInvites();

  const { createInvite, cancelInvite, resendInvite, updateMemberAccess } = useTeamMutations();

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleUpdateMemberAccess = async (data: UpdateMemberAccessData) => {
    if (editingMember) {
      await updateMemberAccess.mutateAsync({ memberId: editingMember.id, data });
      setEditingMember(null);
    }
  };

  const handleCancelInvite = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelInvite.mutateAsync(id);
    } finally {
      setCancellingId(null);
    }
  };

  const handleResendInvite = async (id: string) => {
    setResendingId(id);
    try {
      await resendInvite.mutateAsync(id);
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Time</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie membros e permissões da sua equipe.</p>
        </div>

        {isAdminOrOwner && (
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            size="sm"
            icon={<Plus className="w-5 h-5" />}
          >
            Convidar Membro
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-100">
          <nav className="flex gap-4 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('members')}
              className={`
                cursor-pointer py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <Users className="w-4 h-4" />
              Membros do Time
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs ml-1">
                {members.length}
              </span>
            </button>

            {isAdminOrOwner && (
              <button
                onClick={() => setActiveTab('invites')}
                className={`
                  cursor-pointer py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'invites'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <Mail className="w-4 h-4" />
                Convites
                <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs ml-1">
                  {invites.length}
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'members' ? (
            <UserList
              members={members}
              isLoading={isLoadingMembers}
              isAdminOrOwner={isAdminOrOwner}
              onEdit={handleEditMember}
            />
          ) : (
            isAdminOrOwner && (
              <InviteList
                invites={invites}
                isLoading={isLoadingInvites}
                onCancel={handleCancelInvite}
                onResend={handleResendInvite}
                isCancelling={cancelInvite.isPending}
                isResending={resendInvite.isPending}
                cancellingId={cancellingId}
                resendingId={resendingId}
              />
            )
          )}
        </div>
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={(data) => createInvite.mutateAsync(data)}
        isLoading={createInvite.isPending}
      />

      <EditMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSubmit={handleUpdateMemberAccess}
        isLoading={updateMemberAccess.isPending}
      />
    </div>
  );
};
