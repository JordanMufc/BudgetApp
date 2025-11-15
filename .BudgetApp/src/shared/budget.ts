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
