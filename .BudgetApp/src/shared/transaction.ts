export type TransactionType = "EXPENSE" | "INCOME";

export interface Transaction {
  id: number;
  userId: number;
  accountId: number;
  categoryId?: number | null;
  type: TransactionType;
  amount: number;
  txnDate: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  userId: number;
  accountId: number;
  categoryId?: number | null;
  type: TransactionType;
  amount: number;
  txnDate: string;
  description?: string;
}
