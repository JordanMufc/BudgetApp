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
          <h3>Nouveau compte</h3>
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
          <button type="submit" :disabled="isCreating">
            {{ isCreating ? "Création..." : "Créer le compte" }}
          </button>
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <p v-if="formSuccess" class="form-success">{{ formSuccess }}</p>
        </form>

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
            <li v-for="account in accounts" :key="account.id" class="account-card">
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
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { ACCOUNT_TYPES, type AccountType } from "src/shared/account";
import { useAuth } from "../composables/auth";
import { useAccounts } from "../composables/accounts";

const { currentUser } = useAuth();
const { accounts, isFetching, isCreating, lastError, fetchAccounts, createAccount } = useAccounts();

const accountTypes = ACCOUNT_TYPES;

const form = reactive({
  name: "",
  type: accountTypes[0],
  currency: "EUR",
  initialBalance: 0,
});

const formError = ref<string | null>(null);
const formSuccess = ref<string | null>(null);

const sanitizedCurrency = computed(() => form.currency.trim().toUpperCase().slice(0, 3));

const loadAccounts = async () => {
  if (!currentUser.value) {
    return;
  }

  await fetchAccounts(currentUser.value.id);
};

onMounted(() => {
  if (currentUser.value?.defaultCurrency) {
    form.currency = currentUser.value.defaultCurrency;
  }

  void loadAccounts();
});

watch(
  () => currentUser.value?.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      if (currentUser.value?.defaultCurrency) {
        form.currency = currentUser.value.defaultCurrency;
      }
      await loadAccounts();
    }
  },
);

const resetForm = () => {
  form.name = "";
  form.type = accountTypes[0];
  form.currency = currentUser.value?.defaultCurrency ?? "EUR";
  form.initialBalance = 0;
};

const handleSubmit = async () => {
  if (!currentUser.value) {
    formError.value = "Vous devez être connecté pour créer un compte.";
    return;
  }

  formError.value = null;
  formSuccess.value = null;
  const createdName = form.name;

  try {
    await createAccount({
      userId: currentUser.value.id,
      name: form.name,
      type: form.type,
      currency: sanitizedCurrency.value || "EUR",
      initialBalance: form.initialBalance,
    });

    formSuccess.value = `Compte "${createdName}" créé avec succès.`;
    resetForm();
  } catch (error) {
    if (error instanceof Error) {
      formError.value = error.message;
    } else {
      formError.value = "Création impossible pour le moment.";
    }
  }
};

const refresh = async () => {
  await loadAccounts();
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

@media (max-width: 960px) {
  .accounts-layout {
    grid-template-columns: 1fr;
  }
}
</style>
