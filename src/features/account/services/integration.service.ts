import { server } from '../../../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiToken {
  id: string;
  account_id: string;
  name: string;
  token_prefix: string;
  masked_token: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface CreateTokenResponse {
  token: ApiToken;
  rawToken: string;
}

export interface WebhookEndpoint {
  id: string;
  account_id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  endpoint_id: string;
  account_id: string;
  event_type: string;
  payload: any;
  status: 'PENDING' | 'DELIVERED' | 'FAILED';
  attempts: number;
  max_attempts: number;
  last_attempt_at: string | null;
  response_status: number | null;
  response_body: string | null;
  error_message: string | null;
  delivered_at: string | null;
  created_at: string;
  endpoint?: { url: string };
}

// ─── API Service ─────────────────────────────────────────────────────────────

export const integrationApi = {
  // API Tokens
  getTokens: async (): Promise<ApiToken[]> => {
    const response = await server.api.get('/api-token');
    return response.data;
  },

  createToken: async (name?: string): Promise<CreateTokenResponse> => {
    const response = await server.api.post('/api-token', { name });
    return response.data;
  },

  revealToken: async (tokenId: string): Promise<string> => {
    const response = await server.api.get(`/api-token/${tokenId}/reveal`);
    return response.data.token;
  },

  revokeToken: async (tokenId: string): Promise<void> => {
    await server.api.delete(`/api-token/${tokenId}`);
  },

  updateToken: async (tokenId: string, data: { name?: string; is_active?: boolean }): Promise<ApiToken> => {
    const response = await server.api.patch(`/api-token/${tokenId}`, data);
    return response.data;
  },

  // Webhook Endpoints
  getAvailableEvents: async (): Promise<string[]> => {
    const response = await server.api.get('/webhook/available-events');
    return response.data.events;
  },

  getEndpoints: async (): Promise<WebhookEndpoint[]> => {
    const response = await server.api.get('/webhook/endpoints');
    return response.data;
  },

  createEndpoint: async (url: string, events: string[]): Promise<WebhookEndpoint> => {
    const response = await server.api.post('/webhook/endpoints', { url, events });
    return response.data;
  },

  updateEndpoint: async (endpointId: string, data: { events?: string[]; is_active?: boolean }): Promise<WebhookEndpoint> => {
    const response = await server.api.put(`/webhook/endpoints/${endpointId}`, data);
    return response.data;
  },

  deleteEndpoint: async (endpointId: string): Promise<void> => {
    await server.api.delete(`/webhook/endpoints/${endpointId}`);
  },

  // Webhook Events
  getEvents: async (params: { endpoint_id?: string; cursor?: string; take?: number }): Promise<{ events: WebhookEvent[]; nextCursor: string | null }> => {
    const response = await server.api.get('/webhook/events', { params });
    return response.data;
  },

  getEventDetail: async (eventId: string): Promise<WebhookEvent> => {
    const response = await server.api.get(`/webhook/events/${eventId}`);
    return response.data;
  },
};
