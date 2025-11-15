import { registerBudgetRepository } from "./repositories/registerBudgetRepository";
import { registerAuthRepository } from "./repositories/registerAuthRepository";
import { registerAccountRepository } from "./repositories/registerAccountRepository";
import { registerTransactionRepository } from "./repositories/registerTransactionRepository";

export function registerRepositories() {
  registerBudgetRepository();
  registerAuthRepository();
  registerAccountRepository();
  registerTransactionRepository();
}
