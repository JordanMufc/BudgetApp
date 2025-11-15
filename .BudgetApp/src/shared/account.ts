export type AccountType = "BANK" | "CASH" | "SAVINGS" | "OTHER";

export interface Account {
  id: number;
  userId: number;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountInput {
  userId: number;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  isArchived?: boolean;
}

export const ACCOUNT_TYPES: AccountType[] = ["BANK", "CASH", "SAVINGS", "OTHER"];
