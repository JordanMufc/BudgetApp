import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from "../account";

export default interface IAccountService {
  listByUser: (userId: number) => Promise<Account[]>;
  create: (payload: CreateAccountInput) => Promise<Account>;
  update: (payload: UpdateAccountInput) => Promise<Account>;
  delete: (accountId: number) => Promise<void>;
}
