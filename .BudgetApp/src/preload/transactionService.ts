import { ipcRenderer } from "electron";
import type ITransactionService from "src/shared/interfaces/ITransactionService";
import type { CreateTransactionInput } from "src/shared/transaction";

export function transactionService(): ITransactionService {
  return {
    listByAccount: (payload: { userId: number; accountId: number }) =>
      ipcRenderer.invoke("transactionRepository:listByAccount", payload),
    create: (payload: CreateTransactionInput) =>
      ipcRenderer.invoke("transactionRepository:create", payload),
  };
}
