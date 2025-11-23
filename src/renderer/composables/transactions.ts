import { ref } from "vue";
import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from "src/shared/transaction";

const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const isCreating = ref(false);
const lastError = ref<string | null>(null);
const updatingTransactionId = ref<number | null>(null);
const deletingTransactionId = ref<number | null>(null);

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

  const updateTransaction = async (payload: UpdateTransactionInput) => {
    try {
      updatingTransactionId.value = payload.id;
      const transaction = await window.electronService.transactions.update(
        payload,
      );
      transactions.value = transactions.value.map((item) =>
        item.id === transaction.id ? transaction : item,
      );
      lastError.value = null;
      return transaction;
    } catch (error) {
      console.error("Unable to update transaction", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de mettre à jour la transaction.",
      );
      throw error;
    } finally {
      updatingTransactionId.value = null;
    }
  };

  const deleteTransaction = async (transactionId: number) => {
    try {
      deletingTransactionId.value = transactionId;
      await window.electronService.transactions.delete(transactionId);
      transactions.value = transactions.value.filter(
        (transaction) => transaction.id !== transactionId,
      );
      lastError.value = null;
    } catch (error) {
      console.error("Unable to delete transaction", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de supprimer la transaction.",
      );
      throw error;
    } finally {
      deletingTransactionId.value = null;
    }
  };

  return {
    transactions,
    isLoading,
    isCreating,
    lastError,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updatingTransactionId,
    deletingTransactionId,
  };
}
