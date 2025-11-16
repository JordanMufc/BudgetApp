export type CategoryKind = "EXPENSE" | "INCOME";

export interface Category {
  id: number;
  userId: number;
  name: string;
  kind: CategoryKind;
  parentId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  userId: number;
  name: string;
  kind: CategoryKind;
  parentId?: number | null;
}

export const CATEGORY_KINDS: CategoryKind[] = ["EXPENSE", "INCOME"];
