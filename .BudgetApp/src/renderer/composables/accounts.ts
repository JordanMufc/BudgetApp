import { ref } from "vue";
import type { Account, CreateAccountInput } from "src/shared/account";

const accounts = ref<Account[]>([]);
const isFetching = ref(false);
const isCreating = ref(false);
const lastError = ref<string | null>(null);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export function useAccounts() {
  const fetchAccounts = async (userId: number) => {
    if (!userId) {
      return;
    }

    try {
      isFetching.value = true;
      accounts.value = await window.electronService.accounts.listByUser(userId);
      lastError.value = null;
    } catch (error) {
      console.error("Unable to load accounts", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de récupérer les comptes.",
      );
    } finally {
      isFetching.value = false;
    }
  };

  const createAccount = async (payload: CreateAccountInput) => {
    try {
      isCreating.value = true;
      const account = await window.electronService.accounts.create(payload);
      accounts.value = [account, ...accounts.value];
      lastError.value = null;
      return account;
    } catch (error) {
      console.error("Unable to create account", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de créer le compte.",
      );
      throw error;
    } finally {
      isCreating.value = false;
    }
  };

  return {
    accounts,
    isFetching,
    isCreating,
    lastError,
    fetchAccounts,
    createAccount,
  };
}
