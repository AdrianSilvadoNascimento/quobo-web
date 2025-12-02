import { server } from '../../../services/api';
import { UnitOfMeasureModel } from '../types/unity_of_measure.model';

export class UnitOfMeasureService {
  async getUnits(): Promise<UnitOfMeasureModel[]> {
    try {
      const response = await server.api.get(`/unit-of-measure`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching units of measure:', error);
      throw error;
    }
  }
}

export const unit_of_measure_service = new UnitOfMeasureService();
