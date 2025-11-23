import type {
  Budget,
  BudgetItem,
  UpdateBudgetInput,
  UpdateBudgetItemInput,
} from "src/shared/budget";
import { ref } from "vue";

const budgets = ref<Budget[]>([]);
const isLoading = ref(false);
const lastError = ref<string | null>(null);
const mutatingBudgetId = ref<number | null>(null);
const mutatingBudgetItemId = ref<number | null>(null);

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

  const updateBudget = async (payload: UpdateBudgetInput) => {
    try {
      mutatingBudgetId.value = payload.id;
      await window.electronService.budgets.updateBudget(payload);
      budgets.value = budgets.value.map((budget) =>
        budget.id === payload.id
          ? {
              ...budget,
              year: payload.year ?? budget.year,
              month: payload.month ?? budget.month,
            }
          : budget,
      );
      lastError.value = null;
    } catch (error) {
      console.error("Unable to update budget", error);
      lastError.value = "Impossible de mettre à jour le budget.";
      throw error;
    } finally {
      mutatingBudgetId.value = null;
    }
  };

  const deleteBudget = async (budgetId: number) => {
    try {
      mutatingBudgetId.value = budgetId;
      await window.electronService.budgets.deleteBudget(budgetId);
      budgets.value = budgets.value.filter((budget) => budget.id !== budgetId);
      lastError.value = null;
    } catch (error) {
      console.error("Unable to delete budget", error);
      lastError.value = "Impossible de supprimer le budget.";
      throw error;
    } finally {
      mutatingBudgetId.value = null;
    }
  };

  const updateBudgetItem = async (
    payload: UpdateBudgetItemInput,
  ): Promise<void> => {
    try {
      mutatingBudgetItemId.value = payload.id;
      await window.electronService.budgets.updateBudgetItem(payload);
      budgets.value = budgets.value.map((budget) =>
        budget.id === payload.budgetId
          ? {
              ...budget,
              items: budget.items.map((item) =>
                item.id === payload.id
                  ? {
                      ...item,
                      categoryId: payload.categoryId,
                      amount: payload.amount,
                    }
                  : item,
              ),
            }
          : budget,
      );
      lastError.value = null;
    } catch (error) {
      console.error("Unable to update budget item", error);
      lastError.value = "Impossible de mettre à jour la ligne.";
      throw error;
    } finally {
      mutatingBudgetItemId.value = null;
    }
  };

  const deleteBudgetItem = async (payload: {
    id: number;
    budgetId: number;
  }) => {
    try {
      mutatingBudgetItemId.value = payload.id;
      await window.electronService.budgets.deleteBudgetItem(payload.id);
      budgets.value = budgets.value.map((budget) =>
        budget.id === payload.budgetId
          ? {
              ...budget,
              items: budget.items.filter((item) => item.id !== payload.id),
            }
          : budget,
      );
      lastError.value = null;
    } catch (error) {
      console.error("Unable to delete budget item", error);
      lastError.value = "Impossible de supprimer la ligne.";
      throw error;
    } finally {
      mutatingBudgetItemId.value = null;
    }
  };

  return {
    budgets,
    isLoading,
    lastError,
    fetchBudgets,
    createBudget,
    addBudgetItem,
    updateBudget,
    deleteBudget,
    updateBudgetItem,
    deleteBudgetItem,
    mutatingBudgetId,
    mutatingBudgetItemId,
  };
}
