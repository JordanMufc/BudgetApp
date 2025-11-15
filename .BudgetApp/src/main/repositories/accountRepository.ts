import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, accounts } from "./prisma/generated/client";
import type { Account, CreateAccountInput } from "src/shared/account";

export class AccountRepository {
  private dbclient: PrismaClient;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not defined");
    }

    const adapter = new PrismaMariaDb(databaseUrl);
    this.dbclient = new PrismaClient({ adapter });
  }

  async listByUser(userId: number): Promise<Account[]> {
    const rows = await this.dbclient.accounts.findMany({
      where: { user_id: userId },
      orderBy: [{ created_at: "desc" }],
    });

    return rows.map((row) => this.mapAccount(row));
  }

  async create(payload: CreateAccountInput): Promise<Account> {
    const currency = payload.currency.trim().toUpperCase().slice(0, 3) || "EUR";

    const account = await this.dbclient.accounts.create({
      data: {
        user_id: payload.userId,
        name: payload.name,
        type: payload.type,
        currency,
        initial_balance: payload.initialBalance,
        is_archived: payload.isArchived ?? false,
      },
    });

    return this.mapAccount(account);
  }

  private mapAccount(record: accounts): Account {
    return {
      id: record.id,
      userId: record.user_id,
      name: record.name,
      type: record.type as Account["type"],
      currency: record.currency,
      initialBalance: Number(record.initial_balance),
      isArchived: Boolean(record.is_archived),
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}
