import { server } from '@/services/api';
import type { CreateInviteData, Invite, InviteStats, TeamMember, UpdateMemberAccessData } from '../types/team.types';

export const membersService = {
  getMembers: async (accountId: string): Promise<TeamMember[]> => {
    // GET /members/:accountId
    const response = await server.api.get<any>(`/members/${accountId}`, { withCredentials: true });
    // Backend returns ApiResponse<{ members: TeamMember[] }>
    // Structure: { success: true, data: { members: [...] }, ... }
    return response.data?.data?.members || [];
  },

  getInvites: async (): Promise<Invite[]> => {
    // GET /members/invites
    const response = await server.api.get<any>(`/members/invites`, {
      params: { limit: 100 },
      withCredentials: true
    });
    // Backend uses ApiResponseHelper.paginated which returns { data: [...], pagination: {...} }
    // The outer response.data is from axios, inner is the API response
    return response.data?.data || [];
  },

  createInvite: async (data: CreateInviteData): Promise<any> => {
    // POST /members/invite
    const response = await server.api.post(`/members/invite`, data, { withCredentials: true });
    return response.data?.data;
  },

  cancelInvite: async (inviteId: string): Promise<void> => {
    // DELETE /members/invite/:id
    await server.api.delete(`/members/invite/${inviteId}`, { withCredentials: true });
  },

  resendInvite: async (inviteId: string): Promise<void> => {
    // PUT /members/invite/:id/resend
    await server.api.put(`/members/invite/${inviteId}/resend`, {}, { withCredentials: true });
  },

  getStats: async (): Promise<InviteStats> => {
    // GET /members/stats
    const response = await server.api.get('/members/stats', { withCredentials: true });
    return response.data?.data;
  },

  updateMemberAccess: async (memberId: string, data: UpdateMemberAccessData): Promise<void> => {
    // PUT /members/:memberId/access
    await server.api.put(`/members/${memberId}/access`, data, { withCredentials: true });
  }
};

