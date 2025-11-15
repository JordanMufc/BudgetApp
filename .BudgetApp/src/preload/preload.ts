import { contextBridge } from "electron";
import { budgetService } from "./budgetService";
import { authService } from "./authService";
import { accountService } from "./accountService";
import IElectronService from "src/shared/interfaces/IElectronService";

contextBridge.exposeInMainWorld(
  "electronService",
  {
    budgets: budgetService(),
    auth: authService(),
    accounts: accountService(),
  } as IElectronService,
);
