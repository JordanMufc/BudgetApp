import { ipcRenderer } from "electron";
import IBudgetService from "src/shared/interfaces/IBudgetService";
import { Budget, BudgetItem } from "src/shared/budget";

export function budgetService(): IBudgetService {
  return {
    getBudgets: () => ipcRenderer.invoke("budgetRepository:getBudgets"),
    createBudget: (budget: Budget) =>
      ipcRenderer.invoke("budgetRepository:createBudget", budget),
    addBudgetItem: (budgetId: number, item: BudgetItem) =>
      ipcRenderer.invoke("budgetRepository:addBudgetItem", { budgetId, item }),
  };
}
