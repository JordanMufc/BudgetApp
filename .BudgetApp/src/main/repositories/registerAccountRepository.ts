import { ipcMain } from "electron";
import { AccountRepository } from "./accountRepository";
import type { CreateAccountInput } from "src/shared/account";

export function registerAccountRepository() {
  const repository = new AccountRepository();

  ipcMain.handle(
    "accountRepository:listByUser",
    (_event, userId: number) => repository.listByUser(userId),
  );

  ipcMain.handle(
    "accountRepository:create",
    (_event, payload: CreateAccountInput) => repository.create(payload),
  );
}
