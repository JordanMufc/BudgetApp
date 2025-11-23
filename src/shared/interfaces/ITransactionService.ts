import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from "../transaction";

export default interface ITransactionService {
  listByAccount: (payload: {
    userId: number;
    accountId: number;
  }) => Promise<Transaction[]>;
  create: (payload: CreateTransactionInput) => Promise<Transaction>;
  update: (payload: UpdateTransactionInput) => Promise<Transaction>;
  delete: (transactionId: number) => Promise<void>;
}
