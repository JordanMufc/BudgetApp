<template>
  <li class="item-row">
    <div>
      <p class="item-category">{{ label }}</p>
      <span class="item-meta">Catégorie #{{ props.item.categoryId }}</span>
    </div>
    <span class="item-amount">{{ formattedAmount }}</span>
  </li>
</template>

<script setup lang="ts">
import type { BudgetItem } from "src/shared/budget";
import { computed } from "vue";

const props = defineProps<{
  item: BudgetItem;
}>();

const label = computed(() =>
  props.item.categoryName ?? "Catégorie inconnue",
);

const formattedAmount = computed(() =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(props.item.amount ?? 0),
);
</script>

<style scoped>
.item-row {
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.item-row:last-child {
  border-bottom: none;
}

.item-category {
  font-weight: 600;
  color: #e5e7eb;
}

.item-meta {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.7);
}

.item-amount {
  font-weight: 700;
  color: #fef3c7;
}
</style>
