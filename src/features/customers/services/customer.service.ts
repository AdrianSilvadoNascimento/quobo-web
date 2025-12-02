import { UtilsService } from "@/utils/utils_service";

import type { CustomerModel, CustomerType } from "../types/customer.model";
import { server } from "@/services/api";

export class CustomerService {
  async getPaginatedCustomers(page: number, limit: number) {
    const offset = page * limit;
    return UtilsService.requestPaginated<CustomerModel>('customer', offset, limit);
  }

  async getCustomerById(customer_id: string) {
    try {
      const { data } = await server.api.get(`/customer/by-id/${customer_id}`, { withCredentials: true });
      return data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  async searchCustomers(searchTerm: string, type: CustomerType, limit: number = 50): Promise<CustomerModel[]> {
    try {
      const { data } = await server.api.get(
        `/customer/paginated`,
        {
          params: {
            search: searchTerm,
            type,
            limit
          },
          withCredentials: true
        }
      );
      return data;
    } catch (error) {
      console.error('Search Error:', error);
      throw error;
    }
  }

  async createCustomer(account_id: string, customer: CustomerModel) {
    try {
      customer.account_id = account_id;
      const { data } = await server.api.post('/customer', customer, { withCredentials: true });
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(customer_id: string, customer: Partial<CustomerModel>) {
    try {
      const { data } = await server.api.put(`/customer/${customer_id}`, customer, { withCredentials: true });
      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async inactivateCustomer() {
    try {
      const { data } = await server.api.get(`/customer/inactives`, { withCredentials: true });
      return data;
    } catch (error) {
      console.error('Error updating customer status:', error);
      throw error;
    }
  }

  async deleteCustomer(customer_id: string) {
    try {
      const { data } = await server.api.delete(`/customer/${customer_id}`, { withCredentials: true });
      return data;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }
}

export const customer_service = new CustomerService();
