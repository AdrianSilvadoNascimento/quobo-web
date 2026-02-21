import type { AccountCardModel, SubscriptionModel } from '@/features/account/types/account.model';
import { server } from '../../../services/api';
import type { PlanModel } from '../types/plan.model';

export class PlanService {
  constructor() { }

  async getPlans() {
    try {
      const { data } = await server.api.get<PlanModel[]>('/plan', { withCredentials: true });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createSubscription(args: { subscription: SubscriptionModel, card: AccountCardModel }) {
    try {
      const { data } = await server.api.post('/subscription', args, { withCredentials: true });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createPortalSession(returnUrl: string) {
    try {
      const { data } = await server.api.post<{ url: string }>('/checkout/portal-session', { returnUrl }, { withCredentials: true });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createCheckoutSession(planId: string, successUrl: string, cancelUrl: string) {
    try {
      const { data } = await server.api.post<{ sessionId: string, sessionUrl: string }>('/checkout/create-session', { planId, successUrl, cancelUrl }, { withCredentials: true });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async verifyCheckoutSession(sessionId: string) {
    try {
      const { data } = await server.api.get<{
        id: string;
        status: string;
        payment_status: string;
        customer_email: string;
      }>(`/checkout/session/${sessionId}`, { withCredentials: true });
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export const planService = new PlanService();
