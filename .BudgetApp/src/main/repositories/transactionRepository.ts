import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  PrismaClient,
  transactions,
} from "./prisma/generated/client";
import type {
  CreateTransactionInput,
  Transaction,
} from "src/shared/transaction";

export class TransactionRepository {
  private dbclient: PrismaClient;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not defined");
    }

    const adapter = new PrismaMariaDb(databaseUrl);
    this.dbclient = new PrismaClient({ adapter });
  }

  async listByAccount(payload: {
    userId: number;
    accountId: number;
  }): Promise<Transaction[]> {
    const rows = await this.dbclient.transactions.findMany({
      where: {
        user_id: payload.userId,
        account_id: payload.accountId,
      },
      orderBy: [
        { txn_date: "desc" },
        { created_at: "desc" },
      ],
      take: 50,
    });

    return rows.map((row) => this.mapTransaction(row));
  }

  async create(payload: CreateTransactionInput): Promise<Transaction> {
    const transaction = await this.dbclient.$transaction(async (tx) => {
      const created = await tx.transactions.create({
        data: {
          user_id: payload.userId,
          account_id: payload.accountId,
          category_id: payload.categoryId ?? null,
          type: payload.type,
          amount: payload.amount,
          txn_date: new Date(payload.txnDate),
          description: payload.description,
        },
      });

      await tx.accounts.update({
        where: { id: payload.accountId },
        data:
          payload.type === "EXPENSE"
            ? { initial_balance: { decrement: payload.amount } }
            : { initial_balance: { increment: payload.amount } },
      });

      return created;
    });

    return this.mapTransaction(transaction);
  }

  private mapTransaction(record: transactions): Transaction {
    return {
      id: record.id,
      userId: record.user_id,
      accountId: record.account_id,
      categoryId: record.category_id,
      type: record.type as Transaction["type"],
      amount: Number(record.amount),
      txnDate: record.txn_date.toISOString(),
      description: record.description,
      createdAt: record.created_at.toISOString(),
      updatedAt: record.updated_at.toISOString(),
    };
  }
}
