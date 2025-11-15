import { ipcMain } from "electron";
import { AuthRepository } from "./authRepository";
import type {
  LoginCredentials,
  RegisterUserInput,
} from "src/shared/auth";

export function registerAuthRepository() {
  const repository = new AuthRepository();

  ipcMain.handle(
    "authRepository:register",
    (_event, payload: RegisterUserInput) => repository.register(payload),
  );

  ipcMain.handle(
    "authRepository:login",
    (_event, payload: LoginCredentials) => repository.login(payload),
  );
}
