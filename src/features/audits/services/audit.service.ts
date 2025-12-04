import { server } from '@/services/api';
import { UtilsService } from '@/utils/utils_service';
import type { CreateAuditPayload, ItemAuditModel } from '../types/audit.model';

export class AuditService {
  async getAudits(page: number, limit: number, search?: string) {
    const offset = page * limit;
    // TODO: Pass search param to UtilsService when backend supports it
    // For now, we just pass page and limit. If backend supports filtering via query params, we should append them.
    // Assuming UtilsService.requestPaginated might need an update or we construct URL manually if needed.
    // Actually, UtilsService.requestPaginated takes (endpoint, next, limit).
    // If we want to support search, we might need to change how we call it or update UtilsService.
    return UtilsService.requestPaginated<ItemAuditModel>('item-audit', offset, limit, { search });
  }

  async createAudit(data: CreateAuditPayload): Promise<ItemAuditModel> {
    try {
      const response = await server.api.post('/item-audit/init', data, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  }

  async getAudit(id: string): Promise<ItemAuditModel> {
    try {
      const response = await server.api.get(`/item-audit/${id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit:', error);
      throw error;
    }
  }

  async pauseAudit(id: string): Promise<ItemAuditModel> {
    try {
      const response = await server.api.put(`/item-audit/pause/${id}`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error pausing audit:', error);
      throw error;
    }
  }

  async resumeAudit(id: string): Promise<ItemAuditModel> {
    try {
      const response = await server.api.put(`/item-audit/resume/${id}`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error resuming audit:', error);
      throw error;
    }
  }
}

export const audit_service = new AuditService();
