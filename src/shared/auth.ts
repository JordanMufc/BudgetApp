export interface UserProfile {
  id: number;
  email: string;
  fullName?: string | null;
  defaultCurrency?: string | null;
  role?: "USER" | "ADMIN" | null;
}

export interface RegisterUserInput {
  fullName?: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
