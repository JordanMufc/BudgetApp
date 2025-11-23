import {
  Budget,
  BudgetItem,
  UpdateBudgetInput,
  UpdateBudgetItemInput,
} from "../budget";

export default interface IBudgetService {
  getBudgets: () => Promise<Budget[]>;
  createBudget: (budget: Budget) => Promise<void>;
  addBudgetItem: (budgetId: number, item: BudgetItem) => Promise<void>;
  updateBudget: (payload: UpdateBudgetInput) => Promise<void>;
  deleteBudget: (budgetId: number) => Promise<void>;
  updateBudgetItem: (payload: UpdateBudgetItemInput) => Promise<void>;
  deleteBudgetItem: (itemId: number) => Promise<void>;
}
