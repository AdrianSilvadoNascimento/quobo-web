import { server } from '@/services/api';
import { UtilsService } from '@/utils/utils_service';
import type { CreateAuditPayload, ItemAuditModel } from '../types/audit.model';

export class AuditService {
  async getAudits(page: number, limit: number, search?: string) {
    const offset = page * limit;
    return UtilsService.requestPaginated<ItemAuditModel>('item-audit', offset, limit, { search });
  }

  async createAudit(data: CreateAuditPayload): Promise<ItemAuditModel> {
    try {
      const { data: response }: { data: ItemAuditModel } = await server.api.post('/item-audit/init', data, { withCredentials: true });
      return response;
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  }

  async getAudit(id: string): Promise<ItemAuditModel> {
    try {
      const { data: response }: { data: ItemAuditModel } = await server.api.get(`/item-audit/${id}`, { withCredentials: true });
      return response;
    } catch (error) {
      console.error('Error fetching audit:', error);
      throw error;
    }
  }

  async pauseAudit(id: string): Promise<ItemAuditModel> {
    try {
      const { data: response }: { data: ItemAuditModel } = await server.api.put(`/item-audit/pause/${id}`, {}, { withCredentials: true });
      return response;
    } catch (error) {
      console.error('Error pausing audit:', error);
      throw error;
    }
  }

  async resumeAudit(id: string): Promise<ItemAuditModel> {
    try {
      const { data: response }: { data: ItemAuditModel } = await server.api.put(`/item-audit/resume/${id}`, {}, { withCredentials: true });
      return response;
    } catch (error) {
      console.error('Error resuming audit:', error);
      throw error;
    }
  }

  async getAuditDeepLink(id: string): Promise<{
    deepLink: string;
    webFallback: string;
    qrCodeData: string;
  }> {
    try {
      const { data: response }: {
        data: {
          deepLink: string;
          webFallback: string;
          qrCodeData: string
        }
      } = await server.api.get(`/item-audit/${id}/deep-link`, { withCredentials: true });
      return response;
    } catch (error) {
      console.error('Error fetching audit deep link:', error);
      throw error;
    }
  }
}

export const audit_service = new AuditService();
