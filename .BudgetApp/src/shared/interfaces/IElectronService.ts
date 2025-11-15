import IAuthService from "./IAuthService";
import IAccountService from "./IAccountService";
import IBudgetService from "./IBudgetService";

export default interface IElectronService {
  budgets: IBudgetService;
  auth: IAuthService;
  accounts: IAccountService;
}

declare global {
  interface Window {
    electronService: IElectronService;
  }
}
