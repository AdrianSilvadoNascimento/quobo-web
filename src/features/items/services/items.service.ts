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

  async updateItem(item_id: string, data: Partial<ItemModel>, file?: File): Promise<ItemModel> {
    try {
      // Se houver arquivo, enviar como FormData
      if (file) {
        const formData = new FormData();

        // Adicionar o arquivo
        formData.append('product_image', file);

        // Adicionar os outros campos do item
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
          }
        });

        const response = await server.api.put(`/item/${item_id}`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }

      // Se não houver arquivo, enviar como JSON normal
      const response = await server.api.put(`/item/${item_id}`, data, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async deleteItem(item_id: string): Promise<void> {
    try {
      await server.api.delete(`/item/${item_id}`, { withCredentials: true });
    } catch (error) {
      console.error('Error deleting item:', error);
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

  async getQRCodeData(itemId: string): Promise<{ qrCodeData: string; type: 'barcode' | 'generated' }> {
    const response = await server.api.get(`/item/${itemId}/qrcode-data`, { withCredentials: true });
    return response.data;
  }
}

export const item_service = new ItemService();
