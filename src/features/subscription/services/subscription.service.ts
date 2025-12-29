import { server } from '@/services/api';

export interface CreateSubscriptionDto {
  planId: string;
  paymentMethodId: string;
}

export interface CreateSubscriptionResponse {
  subscription: {
    id: string;
    account_id: string;
    plan_id: string;
    status: string;
    created_at: string;
    next_renewal: string;
  };
  card: {
    id: string;
    card_mask: string;
    brand: string;
  };
  gateway: 'STRIPE' | 'EFI';
  fallback_used: boolean;
}

export class SubscriptionService {
  constructor() { }

  async createSubscription(data: CreateSubscriptionDto): Promise<CreateSubscriptionResponse> {
    try {
      const { data: response } = await server.api.post<CreateSubscriptionResponse>(
        '/subscription',
        {
          subscription: {
            plan_id: data.planId,
            credit_card_token: data.paymentMethodId,
          },
          card: {
            card_token: data.paymentMethodId,
            card_mask: '****',
            brand: 'unknown',
          },
        },
        { withCredentials: true }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
