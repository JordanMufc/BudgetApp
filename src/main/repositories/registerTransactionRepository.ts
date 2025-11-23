import { ipcMain } from "electron";
import { TransactionRepository } from "./transactionRepository";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "src/shared/transaction";

let repositoryInstance: TransactionRepository | null = null;

const getRepository = () => {
  if (!repositoryInstance) {
    repositoryInstance = new TransactionRepository();
  }

  return repositoryInstance;
};

export function registerTransactionRepository() {
  ipcMain.handle(
    "transactionRepository:listByAccount",
    (_event, payload: { userId: number; accountId: number }) =>
      getRepository().listByAccount(payload),
  );

  ipcMain.handle(
    "transactionRepository:create",
    (_event, payload: CreateTransactionInput) =>
      getRepository().create(payload),
  );

  ipcMain.handle(
    "transactionRepository:update",
    (_event, payload: UpdateTransactionInput) =>
      getRepository().update(payload),
  );

  ipcMain.handle(
    "transactionRepository:delete",
    (_event, transactionId: number) =>
      getRepository().delete(transactionId),
  );
}
