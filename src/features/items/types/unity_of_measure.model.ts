export class UnitOfMeasureModel {
  id!: string;
  name!: string;
  abbreviation?: string;
  active!: boolean;
  is_global!: boolean;
  low_stock_threshold!: number;
  account_id!: string | null;
  created_at!: Date;
  updated_at?: Date;
}

export interface CreateUnitOfMeasureDto {
  name: string;
  abbreviation?: string;
  active?: boolean;
  low_stock_threshold?: number;
}
