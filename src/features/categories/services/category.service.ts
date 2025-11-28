import type { PaginatedResponse } from '@/utils/paginated_response.model';
import { server } from '../../../services/api';
import { CategoryModel } from '../types/category.model';

export class CategoryService {
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
          withCredentials: true
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

  async getPaginatedCategories(account_id: string, page: number, limit: number) {
    const offset = page * limit;
    return this.request<CategoryModel>(`category/${account_id}`, offset, limit);
  }

  async getCategories(account_id: string): Promise<CategoryModel[]> {
    try {
      const response = await server.api.get(`/category/${account_id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async createCategory(account_id: string, category: CategoryModel) {
    try {
      const response = await server.api.post(`/category/${account_id}`, category, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(category: CategoryModel) {
    try {
      const response = await server.api.put(`/category/${category.id}`, category, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(category_id: string) {
    try {
      const response = await server.api.delete(`/category/${category_id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

export const category_service = new CategoryService();
