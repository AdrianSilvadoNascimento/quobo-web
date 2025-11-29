import { ItemModel } from "@/features/items/types/item.model";
import { UtilsService } from "@/utils/utils_service";

import { server } from '../../../services/api';

export class ItemService {
  async getProducts(account_id: string, page: number, limit: number) {
    const offset = page * limit;
    return UtilsService.requestPaginated<ItemModel>(`item/${account_id}`, offset, limit);
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
