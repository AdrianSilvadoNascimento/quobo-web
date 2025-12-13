import { server } from './api';

export interface FinanceData {
  subscription?: {
    id: string;
    plan_name?: string;
    plan_value?: number;
    status: string;
    is_expired: boolean;
    is_trial?: boolean;
    next_renewal?: Date;
    next_execution?: Date;
    expiration_trial?: Date;
    created_at?: Date;
    canceled_at?: Date;
  };
  paymentMethod?: {
    card_mask?: string;
    expiration_date?: string;
    brand?: string;
  };
  billingInfo: {
    name: string;
    cpf_cnpj: string;
    email?: string;
    phone_number?: string;
    street?: string;
    house_number?: string;
    neighborhood?: string;
    postal_code?: string;
    city?: string;
    state?: string;
    complement?: string;
    country?: string;
  };
  invoices: Array<{
    id: string;
    charge_id: string;
    plan_name?: string;
    value: number;
    status: string;
    created_at: Date;
    paid_at?: Date;
  }>;
}

export interface UpdateAccountData {
  account_id: string;
  account_user_id: string;
  name?: string;
  email?: string;
  cpf_cnpj?: string;
  phone_number?: string;
  birth?: string;
  type?: string;
}

export const accountApi = {
  getFinanceData: async (): Promise<FinanceData> => {
    const response = await server.api.get(`/account/finance`);
    return response.data;
  },
  cancelSubscription: async (subscriptionId: string): Promise<void> => {
    await server.api.post(`/subscription/${subscriptionId}/cancel`);
  },
  updateAccount: async (data: UpdateAccountData): Promise<any> => {
    const response = await server.api.put('/account', data);
    return response.data;
  },
  getAccount: async (): Promise<any> => {
    const response = await server.api.get('/account');
    return response.data;
  },
};
