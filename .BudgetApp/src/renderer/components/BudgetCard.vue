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
    </header>

    <ul class="items-list">
      <BudgetItemRow
        v-for="item in props.budget.items"
        :key="`${props.budget.id}-${item.id ?? item.categoryId}`"
        :item="item"
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
import { computed, ref } from "vue";
import BudgetItemRow from "./BudgetItemRow.vue";

const props = defineProps<{
  budget: Budget;
}>();

const emit = defineEmits<{
  (
    e: "add-item",
    payload: {
      categoryId: number;
      amount: number;
    },
  ): void;
}>();

const categoryId = ref<number | null>(null);
const amount = ref<number | null>(null);

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
  align-items: center;
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
