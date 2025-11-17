import { ref } from "vue";
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from "src/shared/account";

const accounts = ref<Account[]>([]);
const isFetching = ref(false);
const isCreating = ref(false);
const lastError = ref<string | null>(null);
const updatingAccountId = ref<number | null>(null);
const deletingAccountId = ref<number | null>(null);

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

  const updateAccount = async (payload: UpdateAccountInput) => {
    try {
      updatingAccountId.value = payload.id;
      const account = await window.electronService.accounts.update(payload);
      accounts.value = accounts.value.map((item) =>
        item.id === account.id ? account : item,
      );
      lastError.value = null;
      return account;
    } catch (error) {
      console.error("Unable to update account", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de mettre à jour le compte.",
      );
      throw error;
    } finally {
      updatingAccountId.value = null;
    }
  };

  const deleteAccount = async (accountId: number) => {
    try {
      deletingAccountId.value = accountId;
      await window.electronService.accounts.delete(accountId);
      accounts.value = accounts.value.filter(
        (account) => account.id !== accountId,
      );
      lastError.value = null;
    } catch (error) {
      console.error("Unable to delete account", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de supprimer le compte.",
      );
      throw error;
    } finally {
      deletingAccountId.value = null;
    }
  };

  return {
    accounts,
    isFetching,
    isCreating,
    lastError,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    updatingAccountId,
    deletingAccountId,
  };
}
