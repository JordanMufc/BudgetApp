export interface BudgetItem {
  id?: number;
  budgetId?: number;
  categoryId: number;
  categoryName?: string;
  amount: number;
}

export interface Budget {
  id?: number;
  userId: number;
  year: number;
  month: number;
  createdAt?: Date;
  updatedAt?: Date;
  items: BudgetItem[];
}

export interface UpdateBudgetInput {
  id: number;
  year?: number;
  month?: number;
}

export interface UpdateBudgetItemInput {
  id: number;
  budgetId: number;
  categoryId: number;
  amount: number;
}
