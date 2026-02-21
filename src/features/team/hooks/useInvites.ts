import { useQuery } from '@tanstack/react-query';
import { membersService } from '../services/members.service';
import { useAuth } from '@/contexts/AuthContext';
import { AccountUserType, AccountUserRole } from '../types/team.types';

export const useInvites = () => {
  const { account, user } = useAuth();
  const accountId = account?.id;

  const canViewInvites =
    user?.type === AccountUserType.OWNER ||
    user?.type === AccountUserType.ADMIN ||
    user?.role === AccountUserRole.STORE_MANAGER; // Assuming Manager can also invite/view

  return useQuery({
    queryKey: ['invites', accountId],
    queryFn: async () => {
      try {
        return await membersService.getInvites();
      } catch (error) {
        console.error('Failed to fetch invites:', error);
        return [];
      }
    },
    enabled: !!accountId && canViewInvites,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};
