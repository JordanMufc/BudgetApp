import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, categories } from "./prisma/generated/client";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "src/shared/category";

export class CategoryRepository {
  private dbclient: PrismaClient;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not defined");
    }

    const adapter = new PrismaMariaDb(databaseUrl);
    this.dbclient = new PrismaClient({ adapter });
  }

  async listByUser(userId: number): Promise<Category[]> {
    const rows = await this.dbclient.categories.findMany({
      where: { user_id: userId },
      orderBy: [{ kind: "asc" }, { name: "asc" }],
    });

    return rows.map((row) => this.mapCategory(row));
  }

  async create(payload: CreateCategoryInput): Promise<Category> {
    const category = await this.dbclient.categories.create({
      data: {
        user_id: payload.userId,
        name: payload.name,
        kind: payload.kind,
        parent_id: payload.parentId ?? null,
      },
    });

    return this.mapCategory(category);
  }

  async update(payload: UpdateCategoryInput): Promise<Category> {
    const category = await this.dbclient.categories.update({
      where: { id: payload.id },
      data: {
        name: payload.name ?? undefined,
        kind: payload.kind ?? undefined,
        parent_id:
          payload.parentId !== undefined ? payload.parentId : undefined,
      },
    });

    return this.mapCategory(category);
  }

  async delete(categoryId: number): Promise<void> {
    await this.dbclient.categories.delete({
      where: { id: categoryId },
    });
  }

  private mapCategory(record: categories): Category {
    return {
      id: record.id,
      userId: record.user_id,
      name: record.name,
      kind: record.kind as Category["kind"],
      parentId: record.parent_id,
      createdAt: record.created_at.toISOString(),
      updatedAt: record.updated_at.toISOString(),
    };
  }
}
