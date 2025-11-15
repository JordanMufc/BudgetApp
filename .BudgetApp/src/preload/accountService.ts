import { ipcRenderer } from "electron";
import type IAccountService from "src/shared/interfaces/IAccountService";
import type { CreateAccountInput } from "src/shared/account";

export function accountService(): IAccountService {
  return {
    listByUser: (userId: number) =>
      ipcRenderer.invoke("accountRepository:listByUser", userId),
    create: (payload: CreateAccountInput) =>
      ipcRenderer.invoke("accountRepository:create", payload),
  };
}
