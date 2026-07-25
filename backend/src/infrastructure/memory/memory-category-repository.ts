import type { CreateCategoryInput, UpdateCategoryInput, Category } from '../../domain/entities/category'
import type { CategoryRepository } from '../../domain/repositories/category-repository'

export class MemoryCategoryRepository implements CategoryRepository {
  private readonly items = new Map<string, Category>()

  async findAll(): Promise<Category[]> {
    return [...this.items.values()]
  }

  async findById(id: string): Promise<Category | null> {
    return this.items.get(id) ?? null
  }

  async findByType(type: 'income' | 'expense'): Promise<Category[]> {
    return [...this.items.values()].filter((c) => c.type === type)
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const item: Category = {
      id: crypto.randomUUID(),
      name: input.name,
      type: input.type,
      icon: input.icon ?? 'mdi-help-circle',
      color: input.color ?? '#808080',
      createdAt: new Date().toISOString(),
    }
    this.items.set(item.id, item)
    return item
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category | null> {
    const existing = this.items.get(id)
    if (!existing) return null
    const updated: Category = {
      ...existing,
      name: input.name ?? existing.name,
      type: input.type ?? existing.type,
      icon: input.icon ?? existing.icon,
      color: input.color ?? existing.color,
    }
    this.items.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id)
  }
}
