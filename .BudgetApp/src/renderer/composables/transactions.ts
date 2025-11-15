import { ref } from "vue";
import type {
  CreateTransactionInput,
  Transaction,
} from "src/shared/transaction";

const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const isCreating = ref(false);
const lastError = ref<string | null>(null);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export function useTransactions() {
  const fetchTransactions = async (userId: number, accountId: number) => {
    if (!userId || !accountId) {
      transactions.value = [];
      return;
    }

    try {
      isLoading.value = true;
      transactions.value = await window.electronService.transactions.listByAccount(
        { userId, accountId },
      );
      lastError.value = null;
    } catch (error) {
      console.error("Unable to load transactions", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de récupérer les transactions.",
      );
    } finally {
      isLoading.value = false;
    }
  };

  const createTransaction = async (payload: CreateTransactionInput) => {
    try {
      isCreating.value = true;
      const transaction = await window.electronService.transactions.create(
        payload,
      );
      transactions.value = [transaction, ...transactions.value];
      lastError.value = null;
      return transaction;
    } catch (error) {
      console.error("Unable to create transaction", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de créer la transaction.",
      );
      throw error;
    } finally {
      isCreating.value = false;
    }
  };

  return {
    transactions,
    isLoading,
    isCreating,
    lastError,
    fetchTransactions,
    createTransaction,
  };
}
