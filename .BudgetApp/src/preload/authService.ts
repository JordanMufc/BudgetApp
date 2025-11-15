import { ipcRenderer } from "electron";
import type IAuthService from "src/shared/interfaces/IAuthService";
import type {
  LoginCredentials,
  RegisterUserInput,
} from "src/shared/auth";

export function authService(): IAuthService {
  return {
    register: (payload: RegisterUserInput) =>
      ipcRenderer.invoke("authRepository:register", payload),
    login: (payload: LoginCredentials) =>
      ipcRenderer.invoke("authRepository:login", payload),
  };
}
