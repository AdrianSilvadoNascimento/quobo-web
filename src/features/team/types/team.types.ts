export const AccountUserRole = {
  STORE_MANAGER: 'STORE_MANAGER',
  STOCKIST: 'STOCKIST',
  CASHIER: 'CASHIER',
  SELLER: 'SELLER',
} as const;

export type AccountUserRole = typeof AccountUserRole[keyof typeof AccountUserRole];

export const AccountUserType = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type AccountUserType = typeof AccountUserType[keyof typeof AccountUserType];

export const InviteStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
} as const;

export type InviteStatus = typeof InviteStatus[keyof typeof InviteStatus];

export interface TeamMember {
  id: string;
  name: string;
  lastname: string;
  email: string;
  type: AccountUserType;
  role: AccountUserRole;
  active: boolean;
  last_login?: Date;
  created_at: Date;
  is_online?: boolean;
}

export interface Invite {
  id: string;
  email: string;
  type: AccountUserType;
  role: AccountUserRole;
  status: InviteStatus;
  invite_expires_at: Date;
  created_at: Date;
  invited_by: {
    id: string;
    name: string;
    lastname: string;
  };
}

export interface CreateInviteData {
  email: string;
  role: AccountUserRole;
  type: AccountUserType;
}

export interface InviteStats {
  total_invites: number;
  pending_invites: number;
  accepted_invites: number;
  expired_invites: number;
  cancelled_invites: number;
  rejected_invites: number;
}

export interface UpdateMemberAccessData {
  type?: AccountUserType;
  role?: AccountUserRole;
}

