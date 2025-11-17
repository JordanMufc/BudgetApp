import { ref } from "vue";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "src/shared/category";

const categories = ref<Category[]>([]);
const isFetching = ref(false);
const isCreating = ref(false);
const lastError = ref<string | null>(null);
const updatingCategoryId = ref<number | null>(null);
const deletingCategoryId = ref<number | null>(null);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export function useCategories() {
  const fetchCategories = async (userId: number) => {
    if (!userId) {
      categories.value = [];
      return;
    }

    try {
      isFetching.value = true;
      categories.value = await window.electronService.categories.listByUser(
        userId,
      );
      lastError.value = null;
    } catch (error) {
      console.error("Unable to load categories", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de récupérer les catégories.",
      );
    } finally {
      isFetching.value = false;
    }
  };

  const createCategory = async (payload: CreateCategoryInput) => {
    try {
      isCreating.value = true;
      const category = await window.electronService.categories.create(payload);
      categories.value = [category, ...categories.value];
      lastError.value = null;
      return category;
    } catch (error) {
      console.error("Unable to create category", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de créer la catégorie.",
      );
      throw error;
    } finally {
      isCreating.value = false;
    }
  };

  const updateCategory = async (payload: UpdateCategoryInput) => {
    try {
      updatingCategoryId.value = payload.id;
      const category = await window.electronService.categories.update(payload);
      categories.value = categories.value.map((item) =>
        item.id === category.id ? category : item,
      );
      lastError.value = null;
      return category;
    } catch (error) {
      console.error("Unable to update category", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de mettre à jour la catégorie.",
      );
      throw error;
    } finally {
      updatingCategoryId.value = null;
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      deletingCategoryId.value = categoryId;
      await window.electronService.categories.delete(categoryId);
      categories.value = categories.value.filter(
        (category) => category.id !== categoryId,
      );
      lastError.value = null;
    } catch (error) {
      console.error("Unable to delete category", error);
      lastError.value = getErrorMessage(
        error,
        "Impossible de supprimer la catégorie.",
      );
      throw error;
    } finally {
      deletingCategoryId.value = null;
    }
  };

  return {
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
  };
}
