import IAuthService from "./IAuthService";
import IAccountService from "./IAccountService";
import IBudgetService from "./IBudgetService";
import ITransactionService from "./ITransactionService";

export default interface IElectronService {
  budgets: IBudgetService;
  auth: IAuthService;
  accounts: IAccountService;
  transactions: ITransactionService;
}

declare global {
  interface Window {
    electronService: IElectronService;
  }
}
