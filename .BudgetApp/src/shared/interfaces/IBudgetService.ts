import { Budget, BudgetItem } from "../budget";

export default interface IBudgetService {
  getBudgets: () => Promise<Budget[]>;
  createBudget: (budget: Budget) => Promise<void>;
  addBudgetItem: (budgetId: number, item: BudgetItem) => Promise<void>;
}
