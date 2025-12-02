import { UtilsService } from '@/utils/utils_service';

import { server } from '../../../services/api';
import { CategoryModel } from '../types/category.model';

export class CategoryService {
  async getPaginatedCategories(page: number, limit: number) {
    const offset = page * limit;
    return UtilsService.requestPaginated<CategoryModel>('category', offset, limit);
  }

  async getCategories(): Promise<CategoryModel[]> {
    try {
      const { data } = await server.api.get('/category', { withCredentials: true });
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async searchCategories(term: string): Promise<CategoryModel[]> {
    try {
      const { data } = await server.api.get(`/category/search?term=${term}`, { withCredentials: true });
      return data;
    } catch (error) {
      console.error('Error searching categories:', error);
      throw error;
    }
  }

  async createCategory(category: CategoryModel) {
    try {
      const { data } = await server.api.post('/category', category, { withCredentials: true });
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(category: CategoryModel) {
    try {
      const { data } = await server.api.put(`/category/${category.id}`, category, { withCredentials: true });
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(category_id: string) {
    try {
      const { data } = await server.api.delete(`/category/${category_id}`, { withCredentials: true });
      return data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

export const category_service = new CategoryService();
