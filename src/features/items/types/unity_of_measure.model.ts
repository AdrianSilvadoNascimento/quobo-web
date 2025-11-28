export class UnitOfMeasureModel {
  id!: string;
  name!: UnitOfMeasureType;
  abbreviation?: UnitOfMeasureAbbreviation;
  active!: boolean;
  low_stock_threshold!: number;
  account_id!: string;
  created_at!: Date;
  updated_at?: Date;
}

export const UnitOfMeasureType = {
  SACA: 'SACA',
  FARDO: 'FARDO',
  UNIDADE: 'UNIDADE',
  KG: 'KG',
  GRAMAS: 'GRAMAS',
  METROS: 'METROS',
  CENTIMETROS: 'CENTIMETROS',
  LITROS: 'LITROS',
  MILILITROS: 'MILILITROS'
} as const

export type UnitOfMeasureType = typeof UnitOfMeasureType[keyof typeof UnitOfMeasureType]

export const UnitOfMeasureAbbreviation = {
  S: 'S',
  F: 'F',
  UN: 'UN',
  KG: 'KG',
  G: 'G',
  M: 'M',
  CM: 'CM',
  L: 'L',
  ML: 'ML'
} as const

export type UnitOfMeasureAbbreviation = typeof UnitOfMeasureAbbreviation[keyof typeof UnitOfMeasureAbbreviation]

