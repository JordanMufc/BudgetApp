import type { Account, CreateAccountInput } from "../account";

export default interface IAccountService {
  listByUser: (userId: number) => Promise<Account[]>;
  create: (payload: CreateAccountInput) => Promise<Account>;
}
