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
}

export const planService = new PlanService();
