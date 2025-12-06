import type { MovementModel, MovementType } from "../types/movement.model";
import { UtilsService } from "@/utils/utils_service";
import { server } from '../../../services/api';
import type { PaginatedResponse } from "@/utils/paginated_response.model";

export interface MovementFilters {
  type?: MovementType;
  item_id?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface CreateMovementData {
  move_type: MovementType;
  item_id: string;
  quantity: number;
  description?: string;
  unit_price?: number;
  sale_price?: number;
  total_value?: number;
}

export class MovementService {
  /**
   * Lista movimentações com paginação
   */
  async getMovements(page: number, limit: number): Promise<PaginatedResponse<MovementModel>> {
    const offset = page * limit;
    return UtilsService.requestPaginated<MovementModel>('movementation', offset, limit);
  }

  /**
   * Busca movimentações com filtros
   */
  async searchMovements(
    filters: MovementFilters,
    limit: number = 50
  ): Promise<MovementModel[]> {
    try {
      const params: any = { limit };

      if (filters.type) params.type = filters.type;
      if (filters.item_id) params.item_id = filters.item_id;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const response = await server.api.get('/movementation/search', {
        params,
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Error searching movements:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova movimentação
   */
  async createMovement(data: CreateMovementData): Promise<MovementModel> {
    try {
      // Gerar ou recuperar device ID
      let deviceId = localStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('device_id', deviceId);
      }

      const response = await server.api.post('/movementation', data, {
        withCredentials: true,
        headers: {
          'X-Platform': 'web',
          'X-Device-Id': deviceId,
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating movement:', error);
      throw error;
    }
  }

  /**
   * Busca histórico de movimentações de um produto
   */
  async getItemHistory(
    itemId: string,
    from?: string,
    to?: string
  ): Promise<MovementModel[]> {
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await server.api.get(
        `/movementation/history/${itemId}`,
        { params, withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching item history:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas de movimentações
   */
  async getStatistics(from?: string, to?: string) {
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await server.api.get('/movementation/statistics', {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Busca itens mais movimentados
   */
  async getTopMovedItems(limit: number = 10, from?: string, to?: string) {
    try {
      const params: any = { limit };
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await server.api.get('/movementation/top-items', {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top items:', error);
      throw error;
    }
  }
}

export const movement_service = new MovementService();
