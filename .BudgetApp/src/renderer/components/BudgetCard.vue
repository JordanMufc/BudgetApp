<template>
  <section class="budget-card">
    <header class="budget-header">
      <div>
        <p class="period">{{ monthLabel }}</p>
        <p class="meta">Utilisateur #{{ props.budget.userId }}</p>
      </div>
      <div class="totals">
        <span class="label">Planifié</span>
        <strong class="amount">{{ formattedTotal }}</strong>
      </div>
      <div class="card-actions">
        <button
          class="ghost"
          type="button"
          :disabled="isBudgetBusy"
          @click="toggleEditBudget"
        >
          {{ isEditingBudget ? "Annuler" : "Modifier" }}
        </button>
        <button
          class="danger"
          type="button"
          :disabled="isBudgetBusy"
          @click="requestDeleteBudget"
        >
          {{ isBudgetBusy ? "Suppression..." : "Supprimer" }}
        </button>
      </div>
    </header>

    <form
      v-if="isEditingBudget"
      class="budget-meta-form"
      @submit.prevent="handleBudgetUpdate"
    >
      <label>
        Année
        <input type="number" min="2000" v-model.number="editingYear" required />
      </label>
      <label>
        Mois
        <input type="number" min="1" max="12" v-model.number="editingMonth" required />
      </label>
      <div class="meta-actions">
        <button type="button" class="ghost" @click="cancelBudgetEdition">
          Fermer
        </button>
        <button type="submit" :disabled="isBudgetBusy">
          {{ isBudgetBusy ? "Enregistrement..." : "Enregistrer" }}
        </button>
      </div>
    </form>

    <ul class="items-list">
      <BudgetItemRow
        v-for="item in props.budget.items"
        :key="`${props.budget.id}-${item.id ?? item.categoryId}`"
        :item="item"
        :is-busy="props.mutatingItemId === item.id"
        @update="(payload) => emit('update-item', payload)"
        @delete="(itemId) => emit('delete-item', itemId)"
      />
      <li v-if="!props.budget.items.length" class="empty-state">
        Aucun poste budgétaire pour ce mois.
      </li>
    </ul>

    <form class="inline-form" @submit.prevent="handleAddItem">
      <input
        type="number"
        min="1"
        placeholder="ID catégorie"
        v-model.number="categoryId"
        required
      />
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Montant (€)"
        v-model.number="amount"
        required
      />
      <button type="submit">Ajouter une ligne</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { Budget } from "src/shared/budget";
import { computed, ref, watch } from "vue";
import BudgetItemRow from "./BudgetItemRow.vue";

const props = defineProps<{
  budget: Budget;
  mutatingBudgetId: number | null;
  mutatingItemId: number | null;
}>();

const emit = defineEmits<{
  (
    e: "add-item",
    payload: {
      categoryId: number;
      amount: number;
    },
  ): void;
  (
    e: "update-budget",
    payload: {
      year: number;
      month: number;
    },
  ): void;
  (e: "delete-budget"): void;
  (
    e: "update-item",
    payload: {
      itemId?: number;
      categoryId: number;
      amount: number;
    },
  ): void;
  (e: "delete-item", itemId?: number): void;
}>();

const categoryId = ref<number | null>(null);
const amount = ref<number | null>(null);
const isEditingBudget = ref(false);
const editingYear = ref(props.budget.year);
const editingMonth = ref(props.budget.month);

watch(
  () => props.budget,
  (budget) => {
    editingYear.value = budget.year;
    editingMonth.value = budget.month;
  },
  { deep: true },
);

const isBudgetBusy = computed(
  () => props.mutatingBudgetId === props.budget.id,
);

const monthLabel = computed(() =>
  new Date(props.budget.year, props.budget.month - 1, 1).toLocaleString(
    "fr-FR",
    {
      month: "long",
      year: "numeric",
    },
  ),
);

const total = computed(() =>
  props.budget.items.reduce((sum, item) => sum + (item.amount ?? 0), 0),
);

const formattedTotal = computed(() =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(total.value),
);

const handleAddItem = () => {
  if (props.budget.id == null) {
    return;
  }

  if (categoryId.value == null || amount.value == null) {
    return;
  }

  emit("add-item", {
    categoryId: categoryId.value,
    amount: amount.value,
  });

  categoryId.value = null;
  amount.value = null;
};

const toggleEditBudget = () => {
  isEditingBudget.value = !isEditingBudget.value;
};

const cancelBudgetEdition = () => {
  editingYear.value = props.budget.year;
  editingMonth.value = props.budget.month;
  isEditingBudget.value = false;
};

const handleBudgetUpdate = () => {
  emit("update-budget", {
    year: editingYear.value,
    month: editingMonth.value,
  });
  isEditingBudget.value = false;
};

const requestDeleteBudget = () => {
  if (
    confirm(
      "Voulez-vous vraiment supprimer ce budget ? Cette action est irréversible.",
    )
  ) {
    emit("delete-budget");
    isEditingBudget.value = false;
  }
};
</script>

<style scoped>
.budget-card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.35);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.period {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f8fafc;
  text-transform: capitalize;
}

.meta {
  color: rgba(248, 250, 252, 0.6);
  font-size: 0.85rem;
}

.totals {
  text-align: right;
  color: #f8fafc;
}

.label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: rgba(248, 250, 252, 0.7);
}

.amount {
  display: block;
  font-size: 1.5rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.budget-meta-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.75rem;
  padding: 0.75rem;
}

.budget-meta-form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.85);
}

.budget-meta-form input {
  border-radius: 0.4rem;
  border: 1px solid rgba(59, 130, 246, 0.4);
  background: rgba(15, 23, 42, 0.6);
  padding: 0.45rem 0.6rem;
  color: #f8fafc;
}

.meta-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.ghost,
.danger {
  border-radius: 0.5rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: transparent;
  padding: 0.4rem 0.9rem;
  color: #e2e8f0;
  cursor: pointer;
}

.danger {
  border-color: rgba(248, 113, 113, 0.5);
  color: #fecaca;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.items-list {
  margin: 0;
  padding: 0;
}

.empty-state {
  list-style: none;
  padding: 1rem;
  text-align: center;
  color: rgba(226, 232, 240, 0.7);
  border: 1px dashed rgba(148, 163, 184, 0.4);
  border-radius: 0.5rem;
}

.inline-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  align-items: center;
}

.inline-form input {
  border-radius: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: rgba(15, 118, 230, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.5);
  color: #f8fafc;
}

.inline-form button {
  background: linear-gradient(120deg, #22d3ee, #0ea5e9);
  border: none;
  padding: 0.65rem 1rem;
  border-radius: 0.75rem;
  color: #f8fafc;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.inline-form button:hover {
  transform: translateY(-2px);
}
</style>
