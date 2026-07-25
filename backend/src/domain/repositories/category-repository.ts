import type { CreateCategoryInput, UpdateCategoryInput, Category } from '../entities/category'

export interface CategoryRepository {
  findAll(): Promise<Category[]>
  findById(id: string): Promise<Category | null>
  findByType(type: 'income' | 'expense'): Promise<Category[]>
  create(input: CreateCategoryInput): Promise<Category>
  update(id: string, input: UpdateCategoryInput): Promise<Category | null>
  delete(id: string): Promise<boolean>
}
