import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../category";

export default interface ICategoryService {
  listByUser: (userId: number) => Promise<Category[]>;
  create: (payload: CreateCategoryInput) => Promise<Category>;
  update: (payload: UpdateCategoryInput) => Promise<Category>;
  delete: (categoryId: number) => Promise<void>;
}
