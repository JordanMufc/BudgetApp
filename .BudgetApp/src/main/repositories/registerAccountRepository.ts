import { ipcMain } from "electron";
import { AccountRepository } from "./accountRepository";
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from "src/shared/account";

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

  ipcMain.handle(
    "accountRepository:update",
    (_event, payload: UpdateAccountInput) => repository.update(payload),
  );

  ipcMain.handle(
    "accountRepository:delete",
    (_event, accountId: number) => repository.delete(accountId),
  );
}
