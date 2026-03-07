import { server } from '../../../services/api';
import { UnitOfMeasureModel, CreateUnitOfMeasureDto } from '../types/unity_of_measure.model';

export class UnitOfMeasureService {
  async getUnits(): Promise<UnitOfMeasureModel[]> {
    const response = await server.api.get(`/unit-of-measure`, { withCredentials: true });
    return response.data;
  }

  async getActiveUnits(): Promise<UnitOfMeasureModel[]> {
    const response = await server.api.get(`/unit-of-measure/active`, { withCredentials: true });
    return response.data;
  }

  async createCustomUnit(dto: CreateUnitOfMeasureDto): Promise<UnitOfMeasureModel> {
    const response = await server.api.post(`/unit-of-measure`, dto, { withCredentials: true });
    return response.data;
  }

  async updateUnit(id: string, dto: CreateUnitOfMeasureDto): Promise<UnitOfMeasureModel> {
    const response = await server.api.put(`/unit-of-measure/${id}`, dto, { withCredentials: true });
    return response.data;
  }

  async deleteUnit(id: string): Promise<UnitOfMeasureModel> {
    const response = await server.api.delete(`/unit-of-measure/${id}`, { withCredentials: true });
    return response.data;
  }
}

export const unit_of_measure_service = new UnitOfMeasureService();
