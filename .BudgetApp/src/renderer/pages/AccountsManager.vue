<template>
  <section class="accounts-page">
    <div v-if="!currentUser" class="auth-wall">
      <h2>Authentification requise</h2>
      <p>Merci de vous connecter pour gérer vos comptes.</p>
      <RouterLink class="primary-link" to="/">Aller à la connexion</RouterLink>
    </div>

    <div v-else class="accounts-content">
      <header class="accounts-header">
        <div>
          <p class="eyebrow">Comptes bancaires</p>
          <h2>Bienvenue {{ currentUser.fullName ?? currentUser.email }}</h2>
          <p class="description">
            Créez vos comptes (courant, épargne, cash...) puis suivez vos soldes depuis cette page.
          </p>
        </div>
        <RouterLink class="secondary-link" to="/budgets">Voir les budgets</RouterLink>
      </header>

      <div class="accounts-layout">
        <form class="account-form" @submit.prevent="handleSubmit">
          <h3>{{ isEditingAccount ? "Modifier le compte" : "Nouveau compte" }}</h3>
          <label>
            Nom du compte
            <input v-model="form.name" type="text" placeholder="Compte courant" required />
          </label>
          <label>
            Type
            <select v-model="form.type">
              <option v-for="type in accountTypes" :key="type" :value="type">
                {{ typeLabel(type) }}
              </option>
            </select>
          </label>
          <label>
            Devise
            <input v-model="form.currency" type="text" maxlength="3" placeholder="EUR" required />
          </label>
          <label>
            Solde initial
            <input
              v-model.number="form.initialBalance"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="form.isArchived" />
            <span>Archiver ce compte</span>
          </label>
          <div class="form-actions">
            <button type="submit" :disabled="accountFormSubmitting">
              {{
                accountFormSubmitting
                  ? isEditingAccount
                    ? "Mise à jour..."
                    : "Création..."
                  : isEditingAccount
                    ? "Mettre à jour le compte"
                    : "Créer le compte"
              }}
            </button>
            <button
              v-if="isEditingAccount"
              type="button"
              class="ghost"
              @click="cancelAccountEdit"
            >
              Annuler
            </button>
          </div>
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <p v-if="formSuccess" class="form-success">{{ formSuccess }}</p>
        </form>

        <div class="accounts-right">
          <div class="accounts-list">
            <header>
              <h3>Mes comptes ({{ accounts.length }})</h3>
              <button class="refresh" type="button" :disabled="isFetching" @click="refresh">
                {{ isFetching ? "Actualisation..." : "Actualiser" }}
              </button>
            </header>
            <p v-if="lastError" class="list-error">{{ lastError }}</p>
            <p v-else-if="!accounts.length && !isFetching" class="empty">
              Aucun compte pour le moment. Créez votre premier compte pour démarrer.
            </p>
            <ul class="cards">
              <li
                v-for="account in accounts"
                :key="account.id"
                class="account-card"
                :class="{ selected: account.id === selectedAccountId }"
                tabindex="0"
                @click="selectAccount(account.id)"
                @keydown.enter.prevent="selectAccount(account.id)"
                @keydown.space.prevent="selectAccount(account.id)"
              >
                <div class="card-header">
                  <div>
                    <p class="account-name">{{ account.name }}</p>
                    <p class="account-type">{{ typeLabel(account.type) }}</p>
                  </div>
                  <span class="badge">{{ account.currency }}</span>
                </div>
                <p class="balance">
                  {{ formatNumber(account.initialBalance) }} {{ account.currency }}
                </p>
                <p class="meta">
                  Créé le {{ formatDate(account.createdAt) }}
                  <span v-if="account.isArchived" class="archived">Archivé</span>
                </p>
                <div class="card-actions">
                  <button
                    class="ghost"
                    type="button"
                    :disabled="updatingAccountId === account.id"
                    @click.stop="startAccountEdit(account)"
                  >
                    {{ updatingAccountId === account.id ? "..." : "Modifier" }}
                  </button>
                  <button
                    class="danger"
                    type="button"
                    :disabled="deletingAccountId === account.id"
                    @click.stop="handleDeleteAccount(account)"
                  >
                    {{ deletingAccountId === account.id ? "..." : "Supprimer" }}
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <section class="transactions-panel" v-if="selectedAccount">
            <header>
              <div>
                <p class="eyebrow">Transactions</p>
                <h3>{{ selectedAccount.name }}</h3>
                <p class="description">Ajoutez des dépenses ou revenus pour ce compte.</p>
              </div>
              <span class="badge">{{ selectedAccount.currency }}</span>
            </header>

            <form class="transaction-form" @submit.prevent="handleTransactionSubmit">
              <h4>{{ isEditingTransaction ? "Modifier la transaction" : "Nouvelle transaction" }}</h4>
              <label>
                Type
                <select v-model="transactionForm.type">
                  <option value="EXPENSE">Dépense</option>
                  <option value="INCOME">Revenu</option>
                </select>
              </label>
              <label>
                Catégorie
                <select v-model="transactionForm.categoryId">
                  <option :value="null">Aucune catégorie</option>
                  <option
                    v-for="category in transactionCategoryOptions"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
                <span v-if="categoriesError" class="category-hint error">{{ categoriesError }}</span>
                <span
                  v-else-if="noCategoryAvailable"
                  class="category-hint"
                >
                  Aucune catégorie disponible pour ce type. Créez-les depuis la page
                  <RouterLink to="/categories">Catégories</RouterLink>.
                </span>
              </label>
              <label>
                Montant
                <input
                  v-model.number="transactionForm.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </label>
              <label>
                Date
                <input v-model="transactionForm.txnDate" type="date" required />
              </label>
              <label>
                Description
                <input v-model="transactionForm.description" type="text" placeholder="Note facultative" />
              </label>
              <div class="form-actions">
                <button type="submit" :disabled="transactionFormSubmitting">
                  {{
                    transactionFormSubmitting
                      ? isEditingTransaction
                        ? "Mise à jour..."
                        : "Ajout..."
                      : isEditingTransaction
                        ? "Mettre à jour la transaction"
                        : "Ajouter la transaction"
                  }}
                </button>
                <button
                  v-if="isEditingTransaction"
                  type="button"
                  class="ghost"
                  @click="cancelTransactionEdit"
                >
                  Annuler
                </button>
              </div>
              <p v-if="transactionError" class="form-error">{{ transactionError }}</p>
              <p v-if="transactionSuccess" class="form-success">{{ transactionSuccess }}</p>
            </form>

            <div class="transactions-list">
              <header>
                <h4>Historique récent</h4>
                <span v-if="transactionsLoading">Chargement...</span>
              </header>
              <p v-if="transactionsError" class="list-error">{{ transactionsError }}</p>
              <p v-else-if="!transactions.length && !transactionsLoading" class="empty">
                Aucune transaction pour l'instant.
              </p>
              <ul class="transaction-cards">
                <li v-for="transaction in transactions" :key="transaction.id">
                  <div class="transaction-row">
                    <span class="txn-type" :class="transaction.type.toLowerCase()">
                      {{ typeTransactionLabel(transaction.type) }}
                    </span>
                    <span class="txn-amount" :class="transaction.type.toLowerCase()">
                      {{ formatAmount(transaction.amount, selectedAccount.currency, transaction.type) }}
                    </span>
                  </div>
                  <p class="txn-meta">
                    {{ formatTransactionDate(transaction.txnDate) }}
                    <span v-if="transaction.description">• {{ transaction.description }}</span>
                  </p>
                  <div class="transaction-actions">
                    <button
                      class="ghost"
                      type="button"
                      :disabled="updatingTransactionId === transaction.id"
                      @click="startTransactionEdit(transaction)"
                    >
                      {{ updatingTransactionId === transaction.id ? "..." : "Modifier" }}
                    </button>
                    <button
                      class="danger"
                      type="button"
                      :disabled="deletingTransactionId === transaction.id"
                      @click="handleTransactionDelete(transaction)"
                    >
                      {{ deletingTransactionId === transaction.id ? "..." : "Supprimer" }}
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section v-else class="transactions-panel placeholder">
            <p>Sélectionnez un compte pour consulter et ajouter des transactions.</p>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { ACCOUNT_TYPES, type Account, type AccountType } from "src/shared/account";
import type { Transaction, TransactionType } from "src/shared/transaction";
import { useAuth } from "../composables/auth";
import { useAccounts } from "../composables/accounts";
import { useTransactions } from "../composables/transactions";
import { useCategories } from "../composables/categories";

const { currentUser } = useAuth();
const {
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
} = useAccounts();
const {
  transactions,
  isLoading: transactionsLoading,
  isCreating: transactionsCreating,
  lastError: transactionsError,
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  updatingTransactionId,
  deletingTransactionId,
} = useTransactions();
const {
  categories: categoryList,
  isFetching: categoriesLoading,
  lastError: categoriesError,
  fetchCategories,
} = useCategories();

const accountTypes = ACCOUNT_TYPES;

const form = reactive({
  name: "",
  type: accountTypes[0],
  currency: "EUR",
  initialBalance: 0,
  isArchived: false,
});

const formError = ref<string | null>(null);
const formSuccess = ref<string | null>(null);
const transactionError = ref<string | null>(null);
const transactionSuccess = ref<string | null>(null);
const editingAccountId = ref<number | null>(null);
const isEditingAccount = computed(() => editingAccountId.value !== null);
const accountFormSubmitting = computed(() =>
  isEditingAccount.value
    ? updatingAccountId.value === editingAccountId.value
    : isCreating.value,
);
const editingTransactionId = ref<number | null>(null);
const isEditingTransaction = computed(
  () => editingTransactionId.value !== null,
);
const transactionFormSubmitting = computed(() =>
  isEditingTransaction.value
    ? updatingTransactionId.value === editingTransactionId.value
    : transactionsCreating.value,
);

const sanitizedCurrency = computed(() => form.currency.trim().toUpperCase().slice(0, 3));
const selectedAccountId = ref<number | null>(null);
const selectedAccount = computed(() =>
  accounts.value.find((account) => account.id === selectedAccountId.value),
);

const transactionForm = reactive({
  type: "EXPENSE" as TransactionType,
  amount: 0,
  txnDate: new Date().toISOString().split("T")[0],
  description: "",
  categoryId: null as number | null,
});

const resetForm = () => {
  form.name = "";
  form.type = accountTypes[0];
  form.currency = currentUser.value?.defaultCurrency ?? "EUR";
  form.initialBalance = 0;
  form.isArchived = false;
};

const resetTransactionForm = () => {
  transactionForm.type = "EXPENSE";
  transactionForm.amount = 0;
  transactionForm.txnDate = new Date().toISOString().split("T")[0];
  transactionForm.description = "";
  transactionForm.categoryId = null;
};

const transactionCategoryOptions = computed(() =>
  categoryList.value.filter((category) => category.kind === transactionForm.type),
);

const noCategoryAvailable = computed(
  () => !categoriesLoading.value && !transactionCategoryOptions.value.length,
);

const loadAccounts = async () => {
  if (!currentUser.value) {
    accounts.value = [];
    return;
  }

  await fetchAccounts(currentUser.value.id);
};

const loadCategories = async () => {
  if (!currentUser.value) {
    categoryList.value = [];
    return;
  }

  await fetchCategories(currentUser.value.id);
};

onMounted(() => {
  if (currentUser.value?.defaultCurrency) {
    form.currency = currentUser.value.defaultCurrency;
  }

  void Promise.all([loadAccounts(), loadCategories()]);
});

watch(
  accounts,
  (list) => {
    if (!list.length) {
      selectedAccountId.value = null;
      editingAccountId.value = null;
      resetForm();
      return;
    }

    const selectionStillValid = list.some((account) => account.id === selectedAccountId.value);
    if (!selectionStillValid) {
      selectedAccountId.value = null;
    }

    if (
      editingAccountId.value &&
      !list.some((account) => account.id === editingAccountId.value)
    ) {
      editingAccountId.value = null;
      resetForm();
    }
  },
  { immediate: true },
);

watch(
  () => currentUser.value?.id,
  async (newId, oldId) => {
    if (!newId) {
      accounts.value = [];
      categoryList.value = [];
      selectedAccountId.value = null;
      transactions.value = [];
      editingAccountId.value = null;
      resetForm();
      return;
    }

    if (newId !== oldId) {
      if (currentUser.value?.defaultCurrency) {
        form.currency = currentUser.value.defaultCurrency;
      }
      await Promise.all([loadAccounts(), loadCategories()]);
    }
  },
);

watch(
  [selectedAccountId, () => currentUser.value?.id],
  async ([accountId, userId]) => {
    if (accountId && userId) {
      await fetchTransactions(userId, accountId);
    } else {
      transactions.value = [];
    }
    editingTransactionId.value = null;
    resetTransactionForm();
  },
  { immediate: true },
);

const startTransactionEdit = (transaction: Transaction) => {
  editingTransactionId.value = transaction.id;
  transactionForm.type = transaction.type;
  transactionForm.amount = transaction.amount;
  transactionForm.txnDate = transaction.txnDate.split("T")[0];
  transactionForm.description = transaction.description ?? "";
  transactionForm.categoryId = transaction.categoryId ?? null;
  transactionError.value = null;
  transactionSuccess.value = null;
};

const cancelTransactionEdit = () => {
  editingTransactionId.value = null;
  resetTransactionForm();
};

watch(
  () => transactionForm.type,
  () => {
    if (
      transactionForm.categoryId &&
      !transactionCategoryOptions.value.some(
        (category) => category.id === transactionForm.categoryId,
      )
    ) {
      transactionForm.categoryId = null;
    }
  },
);

const startAccountEdit = (account: Account) => {
  editingAccountId.value = account.id;
  form.name = account.name;
  form.type = account.type;
  form.currency = account.currency;
  form.initialBalance = account.initialBalance;
  form.isArchived = account.isArchived;
  formError.value = null;
  formSuccess.value = null;
};

const cancelAccountEdit = () => {
  editingAccountId.value = null;
  resetForm();
};

const handleSubmit = async () => {
  if (!currentUser.value) {
    formError.value = "Vous devez être connecté pour gérer vos comptes.";
    return;
  }

  const trimmedName = form.name.trim();

  if (!trimmedName) {
    formError.value = "Le nom du compte est requis.";
    return;
  }

  formError.value = null;
  formSuccess.value = null;

  const basePayload = {
    userId: currentUser.value.id,
    name: trimmedName,
    type: form.type,
    currency: sanitizedCurrency.value || "EUR",
    initialBalance: form.initialBalance,
    isArchived: form.isArchived,
  };

  try {
    if (editingAccountId.value) {
      await updateAccount({
        id: editingAccountId.value,
        ...basePayload,
      });
      formSuccess.value = `Compte "${trimmedName}" mis à jour avec succès.`;
      selectedAccountId.value = editingAccountId.value;
      cancelAccountEdit();
    } else {
      const account = await createAccount(basePayload);
      formSuccess.value = `Compte "${trimmedName}" créé avec succès.`;
      resetForm();
      if (account?.id) {
        selectedAccountId.value = account.id;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      formError.value = error.message;
    } else {
      formError.value = "Opération impossible pour le moment.";
    }
  }
};

const handleDeleteAccount = async (account: Account) => {
  if (!currentUser.value) {
    formError.value = "Vous devez être connecté pour gérer vos comptes.";
    return;
  }

  if (
    !confirm(
      `Supprimer le compte "${account.name}" ? Cette action est irréversible.`,
    )
  ) {
    return;
  }

  formError.value = null;
  formSuccess.value = null;

  try {
    await deleteAccount(account.id);
    if (selectedAccountId.value === account.id) {
      selectedAccountId.value = null;
    }
    if (editingAccountId.value === account.id) {
      cancelAccountEdit();
    }
    formSuccess.value = `Compte "${account.name}" supprimé.`;
  } catch (error) {
    if (error instanceof Error) {
      formError.value = error.message;
    } else {
      formError.value = "Suppression impossible pour le moment.";
    }
  }
};

const refresh = async () => {
  await Promise.all([loadAccounts(), loadCategories()]);
};

const selectAccount = (accountId: number) => {
  selectedAccountId.value = accountId;
  transactionError.value = null;
  transactionSuccess.value = null;
  if (editingAccountId.value && editingAccountId.value !== accountId) {
    cancelAccountEdit();
  }
};

const handleTransactionSubmit = async () => {
  if (!currentUser.value || !selectedAccount.value) {
    transactionError.value = "Sélectionnez un compte avant d'ajouter une transaction.";
    return;
  }

  transactionError.value = null;
  transactionSuccess.value = null;
  const previousAccountId = selectedAccountId.value;
  const payload = {
    userId: currentUser.value.id,
    accountId: selectedAccount.value.id,
    type: transactionForm.type,
    categoryId: transactionForm.categoryId ?? undefined,
    amount: transactionForm.amount,
    txnDate: transactionForm.txnDate,
    description: transactionForm.description || undefined,
  };

  try {
    if (editingTransactionId.value) {
      await updateTransaction({
        id: editingTransactionId.value,
        ...payload,
      });
      transactionSuccess.value = "Transaction mise à jour.";
      cancelTransactionEdit();
    } else {
      await createTransaction(payload);
      transactionSuccess.value = "Transaction ajoutée avec succès.";
      resetTransactionForm();
    }

    await fetchAccounts(currentUser.value.id);
    if (previousAccountId) {
      selectedAccountId.value = previousAccountId;
    }
  } catch (error) {
    if (error instanceof Error) {
      transactionError.value = error.message;
    } else {
      transactionError.value = "Ajout impossible pour le moment.";
    }
  }
};

const handleTransactionDelete = async (transaction: Transaction) => {
  if (!currentUser.value || !selectedAccount.value) {
    transactionError.value = "Authentifiez-vous et sélectionnez un compte.";
    return;
  }

  if (
    !confirm("Supprimer cette transaction ? Le solde du compte sera ajusté.")
  ) {
    return;
  }

  transactionError.value = null;
  transactionSuccess.value = null;

  try {
    await deleteTransaction(transaction.id);
    if (editingTransactionId.value === transaction.id) {
      cancelTransactionEdit();
    }
    transactionSuccess.value = "Transaction supprimée.";
    await fetchAccounts(currentUser.value.id);
  } catch (error) {
    if (error instanceof Error) {
      transactionError.value = error.message;
    } else {
      transactionError.value = "Suppression impossible pour le moment.";
    }
  }
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const typeLabel = (type: AccountType) => {
  switch (type) {
    case "BANK":
      return "Compte bancaire";
    case "CASH":
      return "Espèces";
    case "SAVINGS":
      return "Épargne";
    default:
      return "Autre";
  }
};

const typeTransactionLabel = (type: TransactionType) => {
  return type === "EXPENSE" ? "Dépense" : "Revenu";
};

const formatAmount = (amount: number, currency: string, type: TransactionType) => {
  const formatted = formatNumber(amount);
  const sign = type === "EXPENSE" ? "-" : "+";
  return `${sign}${formatted} ${currency}`;
};

const formatTransactionDate = (value: string) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};
</script>

<style scoped>
.accounts-page {
  width: 100%;
}

.auth-wall {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.primary-link,
.secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  font-weight: 600;
}

.primary-link {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
}

.secondary-link {
  border: 1px solid rgba(148, 163, 184, 0.4);
  color: #e2e8f0;
}

.accounts-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 2rem 2.5rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 24px;
  background: rgba(37, 99, 235, 0.1);
  color: #e2e8f0;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.7);
}

.description {
  color: rgba(226, 232, 240, 0.75);
  margin-top: 0.35rem;
  max-width: 500px;
}

.accounts-layout {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr;
  gap: 1.5rem;
}

.account-form {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  color: #e2e8f0;
}

.account-form h3 {
  margin-bottom: 0.25rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #cbd5f5;
}

input,
select {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.4);
  padding: 0.65rem 0.85rem;
  color: #f8fafc;
}

button {
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.5rem;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.35rem;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.checkbox input {
  width: 1rem;
  height: 1rem;
  accent-color: #38bdf8;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.ghost,
.danger {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: transparent;
  color: #e2e8f0;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  margin-top: 0;
}

.danger {
  border-color: rgba(248, 113, 113, 0.5);
  color: #fecaca;
}

.form-error,
.list-error {
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #fecaca;
  padding: 0.6rem 0.85rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
}

.form-success {
  background: rgba(134, 239, 172, 0.12);
  border: 1px solid rgba(134, 239, 172, 0.4);
  color: #bbf7d0;
  padding: 0.6rem 0.85rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
}

.accounts-right {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.accounts-list {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  padding: 1.75rem;
  color: #e2e8f0;
}

.accounts-list header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.refresh {
  border: 1px solid rgba(56, 189, 248, 0.7);
  background: transparent;
  color: #7dd3fc;
  padding: 0.4rem 1rem;
}

.empty {
  text-align: center;
  color: rgba(226, 232, 240, 0.7);
  margin-top: 1.5rem;
}

.cards {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  padding: 0;
  margin: 0;
}

.account-card {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.account-card.selected {
  border-color: rgba(56, 189, 248, 0.8);
  background: rgba(56, 189, 248, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.account-type {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.7);
}

.badge {
  border-radius: 999px;
  padding: 0.2rem 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  font-size: 0.85rem;
}

.balance {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f8fafc;
}

.meta {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.65);
}

.archived {
  margin-left: 0.5rem;
  color: #fbbf24;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.transactions-panel {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  padding: 1.5rem;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transactions-panel.placeholder {
  align-items: center;
  justify-content: center;
  color: rgba(226, 232, 240, 0.7);
  min-height: 200px;
}

.transaction-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.85rem;
}

.transactions-list header,
.transactions-panel header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-form label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #cbd5f5;
}

.transaction-form input,
.transaction-form select {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.4);
  padding: 0.6rem 0.75rem;
  color: #f8fafc;
}

.category-hint {
  font-size: 0.8rem;
  color: rgba(226, 232, 240, 0.7);
  margin-top: 0.2rem;
}

.category-hint a {
  color: #38bdf8;
  text-decoration: underline;
}

.category-hint.error {
  color: #f87171;
}

.transactions-list {
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-cards li {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  padding: 0.85rem 1rem;
  background: rgba(15, 23, 42, 0.35);
}

.transaction-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.txn-type {
  font-weight: 600;
  font-size: 0.9rem;
}

.txn-type.expense {
  color: #f87171;
}

.txn-type.income {
  color: #4ade80;
}

.txn-amount {
  font-weight: 600;
}

.txn-amount.expense {
  color: #f87171;
}

.txn-amount.income {
  color: #4ade80;
}

.txn-meta {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.75);
  margin-top: 0.35rem;
}

.transaction-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .accounts-layout {
    grid-template-columns: 1fr;
  }
}
</style>
