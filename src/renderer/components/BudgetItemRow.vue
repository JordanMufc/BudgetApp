<template>
  <li class="item-row">
    <div v-if="!isEditing" class="row-content">
      <div>
        <p class="item-category">{{ label }}</p>
        <span class="item-meta">Catégorie #{{ props.item.categoryId }}</span>
      </div>
      <span class="item-amount">{{ formattedAmount }}</span>
    </div>
    <form v-else class="inline-edit" @submit.prevent="handleUpdate">
      <label>
        Catégorie
        <input
          type="number"
          min="1"
          v-model.number="editableCategoryId"
          required
        />
      </label>
      <label>
        Montant
        <input
          type="number"
          min="0"
          step="0.01"
          v-model.number="editableAmount"
          required
        />
      </label>
      <div class="edit-actions">
        <button type="button" class="ghost" @click="cancelEdit">
          Annuler
        </button>
        <button type="submit" :disabled="props.isBusy">
          {{ props.isBusy ? "..." : "Enregistrer" }}
        </button>
      </div>
    </form>
    <div class="item-actions" v-if="!isEditing">
      <button
        class="ghost"
        type="button"
        :disabled="!props.item.id || props.isBusy"
        @click="startEdit"
      >
        Modifier
      </button>
      <button
        class="danger"
        type="button"
        :disabled="!props.item.id || props.isBusy"
        @click="requestDelete"
      >
        Supprimer
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { BudgetItem } from "src/shared/budget";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  item: BudgetItem;
  isBusy: boolean;
}>();

const emit = defineEmits<{
  (
    e: "update",
    payload: { itemId?: number; categoryId: number; amount: number },
  ): void;
  (e: "delete", itemId?: number): void;
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

const isEditing = ref(false);
const editableCategoryId = ref(props.item.categoryId);
const editableAmount = ref(props.item.amount ?? 0);

watch(
  () => props.item,
  (item) => {
    editableCategoryId.value = item.categoryId;
    editableAmount.value = item.amount ?? 0;
  },
  { deep: true },
);

const startEdit = () => {
  if (!props.item.id) {
    return;
  }

  isEditing.value = true;
};

const cancelEdit = () => {
  editableCategoryId.value = props.item.categoryId;
  editableAmount.value = props.item.amount ?? 0;
  isEditing.value = false;
};

const handleUpdate = () => {
  emit("update", {
    itemId: props.item.id,
    categoryId: editableCategoryId.value,
    amount: editableAmount.value,
  });
  isEditing.value = false;
};

const requestDelete = () => {
  if (!props.item.id) {
    return;
  }

  if (confirm("Supprimer cette ligne budgétaire ?")) {
    emit("delete", props.item.id);
  }
};
</script>

<style scoped>
.item-row {
  list-style: none;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-row:last-child {
  border-bottom: none;
}

.row-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
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

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.inline-edit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.35);
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.inline-edit label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.8);
}

.inline-edit input {
  border-radius: 0.4rem;
  border: 1px solid rgba(59, 130, 246, 0.4);
  background: rgba(15, 23, 42, 0.6);
  padding: 0.4rem 0.5rem;
  color: #f1f5f9;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.ghost,
.danger {
  border-radius: 0.5rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: transparent;
  padding: 0.35rem 0.75rem;
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
</style>
