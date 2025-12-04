import { AccountModel } from "@/features/account/types/account.model";
import { UnitOfMeasureModel } from "@/features/items/types/unity_of_measure.model";

export const AuditStockStatus = {
  STARTED: 'STARTED',
  PAUSED: 'PAUSED',
  CANCELED: 'CANCELED',
  COMPLETED: 'COMPLETED'
} as const;

export type AuditStockStatus = typeof AuditStockStatus[keyof typeof AuditStockStatus];

export const AuditStockType = {
  TOTAL: 'TOTAL',
  CYCLIC: 'CYCLIC'
} as const;

export type AuditStockType = typeof AuditStockType[keyof typeof AuditStockType];

export interface AuditItem {
  id: string;
  quantity: number;
  name: string;
  image?: string;
  barcode?: string;
  unit_price: number;
  sale_price: number;
  unit_of_measure: UnitOfMeasureModel;
}

export interface CountedItem {
  id: string;
  quantity: number;
  barcode?: string;
}

export interface Discrepancy {
  id: string;
  counted_quantity: number;
  expected_quantity: number;
  barcode?: string;
  type: 'SHORTAGE' | 'SURPLUS' | 'NOT_COUNTED';
}

export interface ItemAuditModel {
  id: string;
  code: string;
  responsible_id: string;
  participants: string[];
  status: AuditStockStatus;
  type: AuditStockType;
  items: AuditItem[];
  counted_items?: CountedItem[];
  discrepancies?: Discrepancy[];
  notes?: string;
  started_at: string;
  completed_at?: string;
  paused_at?: string;
  canceled_at?: string;

  account_id: string;
  account: AccountModel;

  completed_by_user_id?: string;
  completed_from_ip?: string;
  completed_device_id?: string;
  completed_user_agent?: string;
  completed_platform?: string;

  created_at: string;
  updated_at: string;
}

export interface CreateAuditPayload {
  type: AuditStockType;
  participants?: string[];
  categories?: string[];
}
