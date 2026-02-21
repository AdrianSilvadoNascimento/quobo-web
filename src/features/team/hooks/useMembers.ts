import { useQuery } from '@tanstack/react-query';
import { membersService } from '../services/members.service';
import { useAuth } from '@/contexts/AuthContext';

export const useMembers = () => {
  const { account } = useAuth();
  const accountId = account?.id;

  return useQuery({
    queryKey: ['members', accountId],
    queryFn: async () => {
      try {
        return await membersService.getMembers(accountId!);
      } catch (error) {
        console.error('Failed to fetch members:', error);
        return [];
      }
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};
