import type {
  CreateTransactionInput,
  Transaction,
} from "../transaction";

export default interface ITransactionService {
  listByAccount: (payload: {
    userId: number;
    accountId: number;
  }) => Promise<Transaction[]>;
  create: (payload: CreateTransactionInput) => Promise<Transaction>;
}
