import { server } from '../../../services/api';

export interface InviteValidationResponse {
  success: boolean;
  message: string;
  data: {
    invite: {
      id: string;
      email: string;
      role: string;
      type: string;
      status: string;
      account: {
        id: string;
        name: string;
      };
      invitedBy: {
        id: string;
        name: string;
        lastname: string;
      };
    };
    valid: boolean;
    expiresAt: string;
  };
}

export interface AcceptInviteData {
  name: string;
  lastname: string;
  password: string;
  password_confirmation: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  message: string;
  data: {
    user: string;
    account: string;
  };
}

export const publicInviteService = {
  async validateToken(token: string): Promise<InviteValidationResponse> {
    const response = await server.api.get<InviteValidationResponse>(`/api/public/invite/${token}`);
    return response.data;
  },

  async acceptInvite(token: string, data: AcceptInviteData): Promise<AcceptInviteResponse> {
    const response = await server.api.post<AcceptInviteResponse>(`/api/public/invite/${token}/accept`, data);
    return response.data;
  },

  async acceptInviteWithGoogle(token: string, supabaseAccessToken: string): Promise<AcceptInviteResponse> {
    const response = await server.api.post<AcceptInviteResponse>(
      `/api/public/invite/${token}/accept-google`,
      { supabase_access_token: supabaseAccessToken },
    );
    return response.data;
  },
};
