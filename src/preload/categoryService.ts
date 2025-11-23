import { ipcRenderer } from "electron";
import type ICategoryService from "src/shared/interfaces/ICategoryService";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "src/shared/category";

export function categoryService(): ICategoryService {
  return {
    listByUser: (userId: number) =>
      ipcRenderer.invoke("categoryRepository:listByUser", userId),
    create: (payload: CreateCategoryInput) =>
      ipcRenderer.invoke("categoryRepository:create", payload),
    update: (payload: UpdateCategoryInput) =>
      ipcRenderer.invoke("categoryRepository:update", payload),
    delete: (categoryId: number) =>
      ipcRenderer.invoke("categoryRepository:delete", categoryId),
  };
}
