import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./prisma/generated/client";
import { User } from "src/shared/user";

export class TodoRepository {
  private dbclient: PrismaClient;
  constructor() {
    let adapter = new PrismaMariaDb(process.env.DATABASE_URL);
    this.dbclient = new PrismaClient({ adapter });
  }

  async getTodos(): Promise<User[]> {
    let todos = await this.dbclient.users.findMany();

    return todos.map((t) => {
      return {
        nom: t.full_name,
      } as User;
    });
  }
}
