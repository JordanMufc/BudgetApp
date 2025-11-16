import { ipcMain } from "electron";
import { CategoryRepository } from "./categoryRepository";
import type { CreateCategoryInput } from "src/shared/category";

let repositoryInstance: CategoryRepository | null = null;

const getRepository = () => {
  if (!repositoryInstance) {
    repositoryInstance = new CategoryRepository();
  }

  return repositoryInstance;
};

export function registerCategoryRepository() {
  ipcMain.handle("categoryRepository:listByUser", (_event, userId: number) =>
    getRepository().listByUser(userId),
  );

  ipcMain.handle("categoryRepository:create", (_event, payload: CreateCategoryInput) =>
    getRepository().create(payload),
  );
}
