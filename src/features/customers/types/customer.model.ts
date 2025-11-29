import type { AccountModel } from "@/features/account/types/account.model"

export class CustomerModel {
  id!: string
  name!: string
  lastname!: string
  age!: number
  email!: string
  gender!: string

  type!: CustomerType
  document!: string
  phone!: string

  user_id!: string
  account_id!: string
  account?: AccountModel
  active?: boolean

  created_at!: Date
  updated_at?: Date
  deactivated_at?: Date | null

  address?: CustomerAddressEntity
  summary?: Summary
}

export type CustomerType = 'PERSON' | 'COMPANY'

export class Summary {
  customer_id!: string
  last_order!: {
    id: string,
    order_total: number,
    created_at: Date,
    items_count: number
  } | null
  total_spent!: number
  total_items_purchased!: number
  total_orders!: number
}

export class CustomerAddressEntity {
  street!: string;
  house_number!: number;
  neighborhood!: string;
  postal_code!: string;
  country!: string;
  city!: string;
  state!: string;
  complement!: string;
  customer_id?: string;

  created_at!: Date;
  updated_at?: Date | null;
}
