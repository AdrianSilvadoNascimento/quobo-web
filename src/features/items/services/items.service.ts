import { ItemModel } from "@/features/items/types/item.model";
import { UtilsService } from "@/utils/utils_service";

import { server } from '../../../services/api';

export class ItemService {
  async getProducts(page: number, limit: number) {
    const offset = page * limit;
    return UtilsService.requestPaginated<ItemModel>('item', offset, limit);
  }

  async getItem(item_id: string): Promise<ItemModel> {
    try {
      const response = await server.api.get(`/item/${item_id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }

  async createItem(data: Partial<ItemModel>): Promise<ItemModel> {
    try {
      const response = await server.api.post('/item', data, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async updateItem(item_id: string, data: Partial<ItemModel>): Promise<ItemModel> {
    try {
      const response = await server.api.put(`/item/${item_id}`, data, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async searchItems(searchTerm: string, limit: number = 50): Promise<ItemModel[]> {
    try {
      const response = await server.api.get(
        '/item/search',
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
