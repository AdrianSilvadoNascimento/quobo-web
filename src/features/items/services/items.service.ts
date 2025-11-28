import { ItemModel } from "@/features/items/types/item.model";
import { PaginatedResponse } from "../../../utils/paginated_response.model";
import { server } from '../../../services/api';

export class ItemService {
  private async request<T>(
    endpoint: string,
    next: number,
    limit: number
  ): Promise<PaginatedResponse<T>> {
    try {
      const url = `/${endpoint}/paginated?offset=${next}&limit=${limit}`
      const response = await server.api.get(
        url,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (![200, 201].includes(response.status)) throw new Error('Erro ao buscar dados');

      const data = await response.data;
      return {
        data: data.data,
        total: data.total,
        next: data.next,
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getProducts(account_id: string, page: number, limit: number) {
    const offset = page * limit;
    return this.request<ItemModel>(`item/${account_id}`, offset, limit);
  }

  async getItem(account_id: string, item_id: string): Promise<ItemModel> {
    try {
      const response = await server.api.get(`/item/${account_id}/${item_id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }

  async createItem(account_id: string, data: Partial<ItemModel>): Promise<ItemModel> {
    try {
      const response = await server.api.post(`/item/${account_id}`, data, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async updateItem(account_id: string, item_id: string, data: Partial<ItemModel>): Promise<ItemModel> {
    try {
      const response = await server.api.put(`/item/${account_id}/${item_id}`, data, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async searchItems(account_id: string, searchTerm: string, limit: number = 50): Promise<ItemModel[]> {
    try {
      const response = await server.api.get(
        `/item/${account_id}/search`,
        {
          params: {
            term: searchTerm,
            limit: limit
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Search Error:', error);
      throw error;
    }
  }
}

export const item_service = new ItemService();
