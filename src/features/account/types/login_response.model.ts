import type { AccountModel } from "./account.model";
import type { UserModel } from "./user.model";

export class LoginResponseEntity {
  token!: string;
  refresh_token!: string;
  account_user!: UserModel;
  account!: AccountModel;
  is_trial!: boolean;
  is_assinant!: boolean;
  expiration_date!: Date;
  expiration_days!: number;
  account_id!: string;
  expiresIn!: number;
  remember_me!: boolean;
}
