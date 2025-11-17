import { ipcRenderer } from "electron";
import IBudgetService from "src/shared/interfaces/IBudgetService";
import {
  Budget,
  BudgetItem,
  UpdateBudgetInput,
  UpdateBudgetItemInput,
} from "src/shared/budget";

export function budgetService(): IBudgetService {
  return {
    getBudgets: () => ipcRenderer.invoke("budgetRepository:getBudgets"),
    createBudget: (budget: Budget) =>
      ipcRenderer.invoke("budgetRepository:createBudget", budget),
    addBudgetItem: (budgetId: number, item: BudgetItem) =>
      ipcRenderer.invoke("budgetRepository:addBudgetItem", { budgetId, item }),
    updateBudget: (payload: UpdateBudgetInput) =>
      ipcRenderer.invoke("budgetRepository:updateBudget", payload),
    deleteBudget: (budgetId: number) =>
      ipcRenderer.invoke("budgetRepository:deleteBudget", budgetId),
    updateBudgetItem: (payload: UpdateBudgetItemInput) =>
      ipcRenderer.invoke("budgetRepository:updateBudgetItem", payload),
    deleteBudgetItem: (itemId: number) =>
      ipcRenderer.invoke("budgetRepository:deleteBudgetItem", itemId),
  };
}
