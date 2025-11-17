<template>
  <section class="categories-page">
    <div v-if="!currentUser" class="auth-wall">
      <h2>Authentification requise</h2>
      <p>Merci de vous connecter pour gérer vos catégories.</p>
      <RouterLink class="primary-link" to="/">Aller à la connexion</RouterLink>
    </div>

    <div v-else class="categories-content">
      <header class="categories-header">
        <div>
          <p class="eyebrow">Catégories</p>
          <h2>Personnalisez vos dépenses et revenus</h2>
          <p class="description">
            Créez vos catégories pour mieux organiser vos transactions et vos budgets.
          </p>
        </div>
        <RouterLink class="secondary-link" to="/accounts">Voir les comptes</RouterLink>
      </header>

      <div class="categories-layout">
        <form class="category-form" @submit.prevent="handleSubmit">
          <h3>{{ isEditingCategory ? "Modifier la catégorie" : "Nouvelle catégorie" }}</h3>
          <label>
            Nom de la catégorie
            <input v-model="form.name" type="text" placeholder="Courses, Salaire..." required />
          </label>
          <label>
            Type
            <select v-model="form.kind">
              <option value="EXPENSE">Dépense</option>
              <option value="INCOME">Revenu</option>
            </select>
          </label>
          <label>
            Catégorie parente (optionnel)
            <select v-model="form.parentId">
              <option :value="null">Aucune (niveau principal)</option>
              <option v-for="category in parentOptions" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </label>
          <div class="form-actions">
            <button type="submit" :disabled="categoryFormSubmitting">
              {{
                categoryFormSubmitting
                  ? isEditingCategory
                    ? "Mise à jour..."
                    : "Création..."
                  : isEditingCategory
                    ? "Mettre à jour la catégorie"
                    : "Créer la catégorie"
              }}
            </button>
            <button
              v-if="isEditingCategory"
              type="button"
              class="ghost"
              @click="cancelCategoryEdit"
            >
              Annuler
            </button>
          </div>
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <p v-if="formSuccess" class="form-success">{{ formSuccess }}</p>
        </form>

        <div class="categories-list-panel">
          <header>
            <div>
              <h3>Mes catégories ({{ categories.length }})</h3>
              <p class="panel-description">Organisées par type pour faciliter vos choix.</p>
            </div>
            <button class="refresh" type="button" :disabled="isFetching" @click="refresh">
              {{ isFetching ? "Actualisation..." : "Actualiser" }}
            </button>
          </header>
          <p v-if="lastError" class="list-error">{{ lastError }}</p>
          <div class="category-groups">
            <article class="category-group">
              <h4>Dépenses ({{ expenseCategories.length }})</h4>
              <p v-if="!expenseCategories.length && !isFetching" class="empty">
                Aucune catégorie de dépense pour le moment.
              </p>
              <ul class="category-cards">
                <li v-for="category in expenseCategories" :key="category.id">
                  <div>
                    <p class="category-name">{{ category.name }}</p>
                    <p class="category-meta">
                      {{ parentLabel(category.parentId) }} • Créée le
                      {{ formatDate(category.createdAt) }}
                    </p>
                  </div>
                  <div class="category-actions">
                    <button
                      class="ghost"
                      type="button"
                      :disabled="updatingCategoryId === category.id"
                      @click="startCategoryEdit(category)"
                    >
                      {{ updatingCategoryId === category.id ? "..." : "Modifier" }}
                    </button>
                    <button
                      class="danger"
                      type="button"
                      :disabled="deletingCategoryId === category.id"
                      @click="handleDeleteCategory(category)"
                    >
                      {{ deletingCategoryId === category.id ? "..." : "Supprimer" }}
                    </button>
                  </div>
                </li>
              </ul>
            </article>

            <article class="category-group">
              <h4>Revenus ({{ incomeCategories.length }})</h4>
              <p v-if="!incomeCategories.length && !isFetching" class="empty">
                Aucune catégorie de revenu pour le moment.
              </p>
              <ul class="category-cards">
                <li v-for="category in incomeCategories" :key="category.id">
                  <div>
                    <p class="category-name">{{ category.name }}</p>
                    <p class="category-meta">
                      {{ parentLabel(category.parentId) }} • Créée le
                      {{ formatDate(category.createdAt) }}
                    </p>
                  </div>
                  <div class="category-actions">
                    <button
                      class="ghost"
                      type="button"
                      :disabled="updatingCategoryId === category.id"
                      @click="startCategoryEdit(category)"
                    >
                      {{ updatingCategoryId === category.id ? "..." : "Modifier" }}
                    </button>
                    <button
                      class="danger"
                      type="button"
                      :disabled="deletingCategoryId === category.id"
                      @click="handleDeleteCategory(category)"
                    >
                      {{ deletingCategoryId === category.id ? "..." : "Supprimer" }}
                    </button>
                  </div>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import type { Category, CategoryKind } from "src/shared/category";
import { useAuth } from "../composables/auth";
import { useCategories } from "../composables/categories";

const { currentUser } = useAuth();
const {
  categories,
  isFetching,
  isCreating,
  lastError,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updatingCategoryId,
  deletingCategoryId,
} = useCategories();

const form = reactive({
  name: "",
  kind: "EXPENSE" as CategoryKind,
  parentId: null as number | null,
});

const formError = ref<string | null>(null);
const formSuccess = ref<string | null>(null);
const editingCategoryId = ref<number | null>(null);
const isEditingCategory = computed(() => editingCategoryId.value !== null);
const categoryFormSubmitting = computed(() =>
  isEditingCategory.value
    ? updatingCategoryId.value === editingCategoryId.value
    : isCreating.value,
);

const parentOptions = computed(() =>
  categories.value.filter(
    (category) =>
      category.kind === form.kind &&
      category.id !== editingCategoryId.value,
  ),
);
const expenseCategories = computed(() => categories.value.filter((category) => category.kind === "EXPENSE"));
const incomeCategories = computed(() => categories.value.filter((category) => category.kind === "INCOME"));

const parentLabel = (parentId?: number | null) => {
  if (!parentId) {
    return "Niveau principal";
  }

  const parent = categories.value.find((category) => category.id === parentId);
  return parent ? `Sous ${parent.name}` : "Niveau principal";
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const resetForm = () => {
  form.name = "";
  form.parentId = null;
};

const loadCategories = async () => {
  if (!currentUser.value) {
    return;
  }

  await fetchCategories(currentUser.value.id);
};

onMounted(() => {
  void loadCategories();
});

watch(
  () => currentUser.value?.id,
  async (newId, oldId) => {
    if (!newId) {
      categories.value = [];
      form.parentId = null;
      editingCategoryId.value = null;
      resetForm();
      return;
    }

    if (newId !== oldId) {
      await loadCategories();
    }
  },
);

watch(
  () => form.kind,
  () => {
    if (form.parentId && !parentOptions.value.some((category) => category.id === form.parentId)) {
      form.parentId = null;
    }
  },
);

const startCategoryEdit = (category: Category) => {
  editingCategoryId.value = category.id;
  form.name = category.name;
  form.kind = category.kind;
  form.parentId = category.parentId ?? null;
  formError.value = null;
  formSuccess.value = null;
};

const cancelCategoryEdit = () => {
  editingCategoryId.value = null;
  resetForm();
};

const handleDeleteCategory = async (category: Category) => {
  if (
    !confirm(
      `Supprimer la catégorie "${category.name}" ? Cette action est irréversible.`,
    )
  ) {
    return;
  }

  formError.value = null;
  formSuccess.value = null;

  try {
    await deleteCategory(category.id);
    if (editingCategoryId.value === category.id) {
      cancelCategoryEdit();
    }
    formSuccess.value = `Catégorie "${category.name}" supprimée.`;
  } catch (error) {
    if (error instanceof Error) {
      formError.value = error.message;
    } else {
      formError.value = "Suppression impossible pour le moment.";
    }
  }
};

const handleSubmit = async () => {
  if (!currentUser.value) {
    formError.value = "Vous devez être connecté pour créer une catégorie.";
    return;
  }

  if (!form.name.trim()) {
    formError.value = "Le nom de la catégorie est requis.";
    return;
  }

  formError.value = null;
  formSuccess.value = null;
  const createdName = form.name.trim();

  try {
    const payload = {
      userId: currentUser.value.id,
      name: createdName,
      kind: form.kind,
      parentId: form.parentId ?? undefined,
    };

    if (editingCategoryId.value) {
      await updateCategory({
        id: editingCategoryId.value,
        ...payload,
      });
      formSuccess.value = `Catégorie "${createdName}" mise à jour.`;
      cancelCategoryEdit();
    } else {
      await createCategory(payload);
      formSuccess.value = `Catégorie "${createdName}" créée avec succès.`;
      resetForm();
    }
  } catch (error) {
    if (error instanceof Error) {
      formError.value = error.message;
    } else {
      formError.value = "Opération impossible pour le moment.";
    }
  }
};

const refresh = async () => {
  await loadCategories();
};
</script>

<style scoped>
.categories-page {
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

.categories-header {
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

.categories-layout {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr;
  gap: 1.5rem;
}

.category-form {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  color: #e2e8f0;
}

.category-form h3 {
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

.form-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
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

.form-error {
  color: #f87171;
  font-size: 0.85rem;
}

.form-success {
  color: #4ade80;
  font-size: 0.85rem;
}

.categories-list-panel {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  padding: 1.5rem;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.categories-list-panel header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.panel-description {
  margin-top: 0.25rem;
  color: rgba(226, 232, 240, 0.75);
  font-size: 0.9rem;
}

.refresh {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: transparent;
  color: #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  cursor: pointer;
}

.refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.category-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.category-group {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.category-group h4 {
  margin: 0;
}

.category-cards {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-cards li {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 14px;
  padding: 0.75rem 0.9rem;
  background: rgba(15, 23, 42, 0.25);
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-name {
  font-weight: 600;
}

.category-meta {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.7);
  margin-top: 0.2rem;
}

.list-error {
  color: #f87171;
  font-size: 0.9rem;
}

.empty {
  color: rgba(226, 232, 240, 0.7);
  font-size: 0.9rem;
}

@media (max-width: 960px) {
  .categories-layout {
    grid-template-columns: 1fr;
  }

  .categories-header {
    flex-direction: column;
  }
}
</style>
