import type { Category, CreateCategoryInput } from "../category";

export default interface ICategoryService {
  listByUser: (userId: number) => Promise<Category[]>;
  create: (payload: CreateCategoryInput) => Promise<Category>;
}
