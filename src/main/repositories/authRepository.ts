import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import {
  Prisma,
  PrismaClient,
  users,
} from "./prisma/generated/client";
import type {
  LoginCredentials,
  RegisterUserInput,
  UserProfile,
} from "src/shared/auth";

export class AuthRepository {
  private dbclient: PrismaClient;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not defined");
    }

    const adapter = new PrismaMariaDb(databaseUrl);
    this.dbclient = new PrismaClient({ adapter });
  }

  async register(payload: RegisterUserInput): Promise<UserProfile> {
    try {
      const fullName = payload.fullName?.trim();
      const hashedPassword = await bcrypt.hash(payload.password, 10);

      const user = await this.dbclient.users.create({
        data: {
          email: payload.email,
          password_hash: hashedPassword,
          full_name: fullName || undefined,
        },
      });

      return this.mapUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Cette adresse email est déjà utilisée.");
      }

      throw error;
    }
  }

  async login(payload: LoginCredentials): Promise<UserProfile> {
    const user = await this.dbclient.users.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new Error("Identifiants invalides.");
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new Error("Identifiants invalides.");
    }

    return this.mapUser(user);
  }

  private mapUser(user: users): UserProfile {
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      defaultCurrency: user.default_currency,
      role: user.role ?? null,
    };
  }
}
