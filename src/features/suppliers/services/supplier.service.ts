import { server } from '../../../services/api';
import { SupplierModel, SupplierCategoryModel, CreateSupplierDto, UpdateSupplierDto } from '../models/supplier.model';

interface PaginatedResponse<T> {
  data: T[];
  next: number | null;
  total: number;
}

export class SupplierService {
  // ── Suppliers ────────────────────────────────────────────────────────────────

  async create(dto: CreateSupplierDto): Promise<SupplierModel> {
    const response = await server.api.post('/supplier', dto, { withCredentials: true });
    return response.data;
  }

  async findPaginated(page = 0, limit = 20): Promise<PaginatedResponse<SupplierModel>> {
    const response = await server.api.get('/supplier/paginated', {
      params: { page, limit },
      withCredentials: true,
    });
    return response.data;
  }

  async search(term: string, limit = 20): Promise<SupplierModel[]> {
    const response = await server.api.get('/supplier/search', {
      params: { term, limit },
      withCredentials: true,
    });
    return response.data;
  }

  async findById(id: string): Promise<SupplierModel> {
    const response = await server.api.get(`/supplier/${id}`, { withCredentials: true });
    return response.data;
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<SupplierModel> {
    const response = await server.api.put(`/supplier/${id}`, dto, { withCredentials: true });
    return response.data;
  }

  async deactivate(id: string): Promise<SupplierModel> {
    const response = await server.api.delete(`/supplier/${id}`, { withCredentials: true });
    return response.data;
  }

  async getSupplierItems(supplierId: string): Promise<any[]> {
    const response = await server.api.get(`/supplier/${supplierId}/items`, { withCredentials: true });
    return response.data;
  }

  // ── Categories ───────────────────────────────────────────────────────────────

  async listCategories(): Promise<SupplierCategoryModel[]> {
    const response = await server.api.get('/supplier/category/list', { withCredentials: true });
    return response.data;
  }

  async createCategory(name: string): Promise<SupplierCategoryModel> {
    const response = await server.api.post('/supplier/category', { name }, { withCredentials: true });
    return response.data;
  }

  async updateCategory(id: string, name: string): Promise<SupplierCategoryModel> {
    const response = await server.api.put(`/supplier/category/${id}`, { name }, { withCredentials: true });
    return response.data;
  }

  async deleteCategory(id: string): Promise<SupplierCategoryModel> {
    const response = await server.api.delete(`/supplier/category/${id}`, { withCredentials: true });
    return response.data;
  }
}

export const supplier_service = new SupplierService();
