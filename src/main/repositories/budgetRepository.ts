import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./prisma/generated/client";
import {
  Budget,
  BudgetItem,
  UpdateBudgetInput,
  UpdateBudgetItemInput,
} from "src/shared/budget";

export class BudgetRepository {
  private dbclient: PrismaClient;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined");
    }

    const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
    this.dbclient = new PrismaClient({ adapter });
  }

  async getBudgets(): Promise<Budget[]> {
    const budgets = await this.dbclient.budgets.findMany({
      include: {
        budget_items: {
          include: {
            categories: true,
          },
        },
      },
      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
      ],
      take: 24,
    });

    return budgets.map((budget) => ({
      id: budget.id,
      userId: budget.user_id,
      year: budget.year,
      month: budget.month,
      createdAt: budget.created_at,
      updatedAt: budget.updated_at,
      items: budget.budget_items.map((item) => ({
        id: item.id,
        budgetId: item.budget_id,
        categoryId: item.category_id,
        categoryName: item.categories?.name,
        amount: Number(item.amount),
      })),
    }));
  }

  async createBudget(budget: Budget): Promise<void> {
    const items = budget.items ?? [];

    await this.dbclient.budgets.create({
      data: {
        user_id: budget.userId,
        year: budget.year,
        month: budget.month,
        budget_items: items.length
          ? {
              create: items.map((item) => ({
                category_id: item.categoryId,
                amount: item.amount,
              })),
            }
          : undefined,
      },
    });
  }

  async addBudgetItem(budgetId: number, item: BudgetItem): Promise<void> {
    await this.dbclient.budget_items.create({
      data: {
        budget_id: budgetId,
        category_id: item.categoryId,
        amount: item.amount,
      },
    });
  }

  async updateBudget(payload: UpdateBudgetInput): Promise<void> {
    await this.dbclient.budgets.update({
      where: { id: payload.id },
      data: {
        year: payload.year ?? undefined,
        month: payload.month ?? undefined,
      },
    });
  }

  async deleteBudget(budgetId: number): Promise<void> {
    await this.dbclient.budgets.delete({
      where: { id: budgetId },
    });
  }

  async updateBudgetItem(payload: UpdateBudgetItemInput): Promise<void> {
    await this.dbclient.budget_items.update({
      where: { id: payload.id },
      data: {
        category_id: payload.categoryId,
        amount: payload.amount,
      },
    });
  }

  async deleteBudgetItem(itemId: number): Promise<void> {
    await this.dbclient.budget_items.delete({
      where: { id: itemId },
    });
  }
}
