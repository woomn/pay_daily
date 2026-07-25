import type { CreateCategoryInput, UpdateCategoryInput, Category } from '../domain/entities/category'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { CategoryRepository } from '../domain/repositories/category-repository'

export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async listCategories(type?: 'income' | 'expense'): Promise<Category[]> {
    if (type) return this.categoryRepository.findByType(type)
    return this.categoryRepository.findAll()
  }

  async getCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id)
    if (!category) throw new NotFoundError('Category')
    return category
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    if (!input.name?.trim()) throw new ValidationError('name is required')
    if (input.type !== 'income' && input.type !== 'expense') {
      throw new ValidationError('type must be "income" or "expense"')
    }
    return this.categoryRepository.create({ ...input, name: input.name.trim() })
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    if (input.type !== undefined && input.type !== 'income' && input.type !== 'expense') {
      throw new ValidationError('type must be "income" or "expense"')
    }
    const updated = await this.categoryRepository.update(id, input)
    if (!updated) throw new NotFoundError('Category')
    return updated
  }

  async deleteCategory(id: string): Promise<void> {
    const deleted = await this.categoryRepository.delete(id)
    if (!deleted) throw new NotFoundError('Category')
  }
}
