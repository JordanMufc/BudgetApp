import { ipcMain } from "electron";
import { BudgetRepository } from "./budgetRepository";
import {
  Budget,
  BudgetItem,
  UpdateBudgetInput,
  UpdateBudgetItemInput,
} from "src/shared/budget";

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

  ipcMain.handle(
    "budgetRepository:updateBudget",
    (_e, payload: UpdateBudgetInput) => {
      return repository.updateBudget(payload);
    },
  );

  ipcMain.handle(
    "budgetRepository:deleteBudget",
    (_e, budgetId: number) => {
      return repository.deleteBudget(budgetId);
    },
  );

  ipcMain.handle(
    "budgetRepository:updateBudgetItem",
    (_e, payload: UpdateBudgetItemInput) => {
      return repository.updateBudgetItem(payload);
    },
  );

  ipcMain.handle(
    "budgetRepository:deleteBudgetItem",
    (_e, itemId: number) => {
      return repository.deleteBudgetItem(itemId);
    },
  );
}
