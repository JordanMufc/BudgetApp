import { registerBudgetRepository } from "./repositories/registerBudgetRepository";
import { registerAuthRepository } from "./repositories/registerAuthRepository";
import { registerAccountRepository } from "./repositories/registerAccountRepository";

export function registerRepositories() {
  registerBudgetRepository();
  registerAuthRepository();
  registerAccountRepository();
}
