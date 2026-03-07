export interface SupplierAddressModel {
  id?: string;
  street: string;
  house_number?: string;
  neighborhood?: string;
  postal_code: string;
  city: string;
  state: string;
  country?: string;
  complement?: string;
}

export interface SupplierCategoryModel {
  id: string;
  name: string;
  account_id: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierModel {
  id: string;
  name: string;
  trade_name?: string;
  document?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  active: boolean;
  account_id: string;
  category_id?: string;
  category?: SupplierCategoryModel;
  address?: SupplierAddressModel;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierDto {
  name: string;
  trade_name?: string;
  document?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  category_id?: string;
  address?: SupplierAddressModel;
}

export interface UpdateSupplierDto extends CreateSupplierDto {
  active?: boolean;
}
