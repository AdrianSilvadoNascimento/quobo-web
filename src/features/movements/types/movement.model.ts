export type MovementType = 'ENTRY' | 'OUT' | 'ADJUST' | 'TRANSFER' | 'SALE';

export interface ItemModel {
  id: string;
  name: string;
  barcode?: string;
  product_image?: string;
  category?: {
    id: string;
    name: string;
  };
  unit_of_measure?: {
    id: string;
    name: string;
    abbreviation?: string;
  };
}

export interface AccountUserModel {
  id: string;
  name: string;
  lastname: string;
  email: string;
  avatar?: string;
}

export interface MovementModel {
  id: string;
  move_type: MovementType;
  quantity: number;
  description?: string;
  unit_price?: number;
  sale_price?: number;
  total_value?: number;

  item_id: string;
  item?: ItemModel;

  account_id: string;
  account_user_id?: string;
  account_user?: AccountUserModel;

  customer_id?: string;
  order_id?: string;

  created_at: Date;
  updated_at?: Date;
}

export interface PaginatedMovements {
  data: MovementModel[];
  next: string | null;
  totalRecords: number;
}
