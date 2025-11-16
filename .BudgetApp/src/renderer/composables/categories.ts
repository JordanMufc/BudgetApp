import { ref } from "vue";
import type { Category, CreateCategoryInput } from "src/shared/category";

const categories = ref<Category[]>([]);
const isFetching = ref(false);
const isCreating = ref(false);
const lastError = ref<string | null>(null);

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

  return {
    categories,
    isFetching,
    isCreating,
    lastError,
    fetchCategories,
    createCategory,
  };
}
