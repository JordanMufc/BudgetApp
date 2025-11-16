import IAuthService from "./IAuthService";
import IAccountService from "./IAccountService";
import IBudgetService from "./IBudgetService";
import ITransactionService from "./ITransactionService";
import ICategoryService from "./ICategoryService";

export default interface IElectronService {
  budgets: IBudgetService;
  auth: IAuthService;
  accounts: IAccountService;
  transactions: ITransactionService;
  categories: ICategoryService;
}

declare global {
  interface Window {
    electronService: IElectronService;
  }
}
