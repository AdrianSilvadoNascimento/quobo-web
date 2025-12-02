export class UserModel {
  id!: string;
  name!: string;
  lastname!: string;
  email!: string;
  avatar!: string;
  phone_number!: string;
  confirm_password!: string;
  token!: string;
  refresh_token?: string
  type!: AccountType;
  role!: AccountUserRole;
  first_access!: boolean;
  password_confirmed!: boolean;
  remember_me?: boolean;
  address!: string;
  city!: string;
  state!: string;
  country!: string;
  zip_code!: string;
  created_at!: Date;
  updated_at!: Date;

  constructor() {
    this.id = '';
    this.name = '';
    this.lastname = '';
    this.email = '';
    this.avatar = '';
    this.phone_number = '';
    this.address = '';
    this.city = '';
    this.state = '';
    this.country = '';
    this.zip_code = '';
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}

export const AccountType = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];

export const AccountUserRole = {
  STORE_MANAGER: 'STORE_MANAGER',
  STOCKIST: 'STOCKIST',
  CASHIER: 'CASHIER',
  SELLER: 'SELLER',
} as const;

export type AccountUserRole = typeof AccountUserRole[keyof typeof AccountUserRole];
