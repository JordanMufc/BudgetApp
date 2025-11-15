import { ipcMain } from "electron";
import { BudgetRepository } from "./budgetRepository";
import { Budget, BudgetItem } from "src/shared/budget";

export function registerBudgetRepository() {
  const repository = new BudgetRepository();

  ipcMain.handle("budgetRepository:getBudgets", () => {
    return repository.getBudgets();
  });

  ipcMain.handle("budgetRepository:createBudget", (_e, budget: Budget) => {
    return repository.createBudget(budget);
  });

  ipcMain.handle(
    "budgetRepository:addBudgetItem",
    (_e, payload: { budgetId: number; item: BudgetItem }) => {
      return repository.addBudgetItem(payload.budgetId, payload.item);
    },
  );
}
