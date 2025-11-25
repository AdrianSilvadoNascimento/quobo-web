// Plan model interfaces adapted from novo_egest_web
export interface ProductLimits {
  max_products: number;
  unlimited: boolean;
}

export interface UserLimits {
  max_users: number;
  unlimited: boolean;
}

export interface TeamFeatures {
  enabled: boolean;
  max_teams: number;
}

export interface BranchFeatures {
  enabled: boolean;
  max_branches: number;
}

export interface ApiAccess {
  enabled: boolean;
  rate_limit: number;
}

export interface ImportFeatures {
  excel_import: boolean;
  bulk_operations: boolean;
}

export interface Reporting {
  basic_reports: boolean;
  advanced_reports: boolean;
  custom_reports: boolean;
}

export interface Support {
  email_support: boolean;
  priority_support: boolean;
  phone_support: boolean;
}

export interface PlanFeatures {
  product_limits: ProductLimits;
  user_limits: UserLimits;
  team_features: TeamFeatures;
  branch_features: BranchFeatures;
  api_access: ApiAccess;
  import_features: ImportFeatures;
  reporting: Reporting;
  support: Support;
}

export interface PlanModel {
  id: string;
  name: string;
  service: string;
  value: number;
  interval: number;
  repeats: number;
  description: string;
  currency: string;
  status: string;
  feature_list: string[];
  features: PlanFeatures;
}

export interface CreditCardModel {
  card_number: string;
  card_holder_name: string;
  expiration_month: number;
  expiration_year: number;
  security_code: string;
  cpf_cnpj: string;
}

export interface CheckoutRequest {
  plan_id: string;
  account_id: string;
  credit_card_token: string;
  card_mask: string;
  expiration_date: string;
  holder_document: string;
  brand: string;
}
