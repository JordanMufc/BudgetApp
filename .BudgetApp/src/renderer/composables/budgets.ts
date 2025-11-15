import type { Budget, BudgetItem } from "src/shared/budget";
import { ref } from "vue";

const budgets = ref<Budget[]>([]);
const isLoading = ref(false);
const lastError = ref<string | null>(null);

export function useBudgets() {
  const fetchBudgets = async () => {
    try {
      isLoading.value = true;
      budgets.value = await window.electronService.budgets.getBudgets();
      lastError.value = null;
    } catch (error) {
      console.error("Unable to load budgets", error);
      lastError.value = "Impossible de récupérer les budgets";
    } finally {
      isLoading.value = false;
    }
  };

  const createBudget = async (budget: Budget) => {
    await window.electronService.budgets.createBudget(budget);
    await fetchBudgets();
  };

  const addBudgetItem = async (budgetId: number, item: BudgetItem) => {
    await window.electronService.budgets.addBudgetItem(budgetId, item);
    await fetchBudgets();
  };

  return {
    budgets,
    isLoading,
    lastError,
    fetchBudgets,
    createBudget,
    addBudgetItem,
  };
}
