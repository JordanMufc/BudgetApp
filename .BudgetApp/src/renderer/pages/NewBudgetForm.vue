<template>
  <section class="form-wrapper">
    <button class="back" @click="router.back()">← Retour</button>

    <h2>Créer un nouveau budget mensuel</h2>

    <form class="budget-form" @submit.prevent="handleSubmit">
      <div class="row">
        <label>
          Utilisateur
          <input type="number" v-model.number="userId" min="1" required />
        </label>

        <label>
          Année
          <input type="number" v-model.number="year" min="2000" required />
        </label>

        <label>
          Mois
          <input type="number" v-model.number="month" min="1" max="12" required />
        </label>
      </div>

      <h3>Lignes budgétaires</h3>

      <div class="items">
        <div class="item" v-for="(item, index) in items" :key="index">
          <label>
            ID Catégorie
            <input
              type="number"
              min="1"
              v-model.number="item.categoryId"
              required
            />
          </label>
          <label>
            Montant (€)
            <input
              type="number"
              min="0"
              step="0.01"
              v-model.number="item.amount"
              required
            />
          </label>
          <button
            v-if="items.length > 1"
            type="button"
            class="remove"
            @click="removeItem(index)"
          >
            Supprimer
          </button>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="secondary" @click="addItem">
          Ajouter une ligne
        </button>
        <button type="submit" class="primary">Créer le budget</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useBudgets } from "../composables/budgets";
import type { BudgetItem } from "src/shared/budget";

const { createBudget } = useBudgets();
const router = useRouter();

const current = new Date();
const year = ref(current.getFullYear());
const month = ref(current.getMonth() + 1);
const userId = ref(1);
const items = ref<BudgetItem[]>([
  {
    categoryId: 1,
    amount: 0,
  },
]);

const addItem = () => {
  items.value.push({
    categoryId: 1,
    amount: 0,
  });
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
};

const handleSubmit = async () => {
  await createBudget({
    userId: userId.value,
    year: year.value,
    month: month.value,
    items: items.value.map((item) => ({
      categoryId: item.categoryId,
      amount: item.amount,
    })),
  });

  router.push("/");
};
</script>

<style scoped>
.form-wrapper {
  max-width: 760px;
  margin: 0 auto;
  background: rgba(15, 23, 42, 0.85);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #f8fafc;
}

.back {
  background: transparent;
  border: none;
  color: #7dd3fc;
  cursor: pointer;
  margin-bottom: 1rem;
}

h2 {
  margin-bottom: 1.5rem;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.8);
}

input {
  background: rgba(15, 118, 230, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.25);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #f8fafc;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: center;
}

.remove {
  background: transparent;
  border: 1px solid rgba(248, 113, 113, 0.5);
  color: #fecaca;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  cursor: pointer;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.secondary,
.primary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.85rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.secondary {
  background: transparent;
  border: 1px solid rgba(14, 165, 233, 0.5);
  color: #7dd3fc;
}

.primary {
  background: linear-gradient(120deg, #c084fc, #8b5cf6);
  color: white;
  box-shadow: 0 15px 35px rgba(139, 92, 246, 0.35);
}
</style>
