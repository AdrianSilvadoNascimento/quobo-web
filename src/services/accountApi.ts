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

export const accountApi = {
  getFinanceData: async (accountId: string): Promise<FinanceData> => {
    const response = await server.api.get(`/account/${accountId}/finance`);
    return response.data;
  },
};
