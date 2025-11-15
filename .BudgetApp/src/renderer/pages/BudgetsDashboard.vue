<template>
  <section>
    <div class="info-banner">
      <div>
        <p class="title">Synthèse budgets</p>
        <p class="subtitle">Suivez vos enveloppes mensuelles et ajustez-les en temps réel.</p>
      </div>
      <button class="refresh" @click="fetchBudgets">Actualiser</button>
    </div>

    <div v-if="lastError" class="error-box">{{ lastError }}</div>

    <div class="grid">
      <BudgetCard
        v-for="budget in budgets"
        :key="budget.id"
        :budget="budget"
        @add-item="(payload) => handleAddItem(budget.id, payload)"
      />
    </div>

    <p v-if="!budgets.length && !isLoading" class="empty">
      Aucun budget enregistré pour le moment. Commencez par créer votre première enveloppe.
    </p>
  </section>
  <AddBudgetButton />
</template>

<script setup lang="ts">
import type { BudgetItem } from "src/shared/budget";
import { onMounted } from "vue";
import BudgetCard from "../components/BudgetCard.vue";
import AddBudgetButton from "../components/AddBudgetButton.vue";
import { useBudgets } from "../composables/budgets";

const { budgets, fetchBudgets, addBudgetItem, isLoading, lastError } =
  useBudgets();

onMounted(() => {
  fetchBudgets();
});

const handleAddItem = async (
  budgetId: number | undefined,
  payload: { categoryId: number; amount: number },
) => {
  if (!budgetId) {
    return;
  }

  const item: BudgetItem = {
    categoryId: payload.categoryId,
    amount: payload.amount,
  };

  await addBudgetItem(budgetId, item);
};
</script>

<style scoped>
.info-banner {
  background: rgba(15, 118, 230, 0.18);
  border: 1px solid rgba(14, 165, 233, 0.4);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  color: #e0f2fe;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
}

.subtitle {
  color: rgba(224, 242, 254, 0.8);
}

.refresh {
  border: 1px solid rgba(14, 165, 233, 0.7);
  background: transparent;
  color: #7dd3fc;
  border-radius: 999px;
  padding: 0.45rem 1.25rem;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.empty {
  margin-top: 2rem;
  text-align: center;
  color: rgba(226, 232, 240, 0.75);
}

.error-box {
  background: rgba(248, 113, 113, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.35);
  color: #fecaca;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}
</style>
