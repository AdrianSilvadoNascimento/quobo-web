import { useMutation, useQueryClient } from '@tanstack/react-query';
import { membersService } from '../services/members.service';
import { useAuth } from '@/contexts/AuthContext';
import type { CreateInviteData } from '../types/team.types';

export const useTeamMutations = () => {
  const queryClient = useQueryClient();
  const { account } = useAuth();
  const accountId = account?.id;

  const createInvite = useMutation({
    mutationFn: (data: CreateInviteData) => membersService.createInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites', accountId] });
      queryClient.invalidateQueries({ queryKey: ['stats', accountId] });
    },
  });

  const cancelInvite = useMutation({
    mutationFn: (inviteId: string) => membersService.cancelInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites', accountId] });
      queryClient.invalidateQueries({ queryKey: ['stats', accountId] });
    },
  });

  const resendInvite = useMutation({
    mutationFn: (inviteId: string) => membersService.resendInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites', accountId] });
      // Stats might change if expiration is reset?
    },
  });

  return {
    createInvite,
    cancelInvite,
    resendInvite,
  };
};
