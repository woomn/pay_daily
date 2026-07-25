import type { CreateCategoryInput, UpdateCategoryInput, Category } from '../../domain/entities/category'
import type { CategoryRepository } from '../../domain/repositories/category-repository'

interface CategoryRow {
  id: string
  name: string
  type: string
  icon: string
  color: string
  created_at: string
}

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type as 'income' | 'expense',
    icon: row.icon,
    color: row.color,
    createdAt: row.created_at,
  }
}

export class D1CategoryRepository implements CategoryRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<Category[]> {
    const { results } = await this.db
      .prepare('SELECT id, name, type, icon, color, created_at FROM categories ORDER BY type, name')
      .all<CategoryRow>()
    return results.map(toCategory)
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.db
      .prepare('SELECT id, name, type, icon, color, created_at FROM categories WHERE id = ?')
      .bind(id)
      .first<CategoryRow>()
    return row ? toCategory(row) : null
  }

  async findByType(type: 'income' | 'expense'): Promise<Category[]> {
    const { results } = await this.db
      .prepare('SELECT id, name, type, icon, color, created_at FROM categories WHERE type = ? ORDER BY name')
      .bind(type)
      .all<CategoryRow>()
    return results.map(toCategory)
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const icon = input.icon ?? 'mdi-help-circle'
    const color = input.color ?? '#808080'
    await this.db
      .prepare('INSERT INTO categories (id, name, type, icon, color, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, input.name, input.type, icon, color, createdAt)
      .run()
    return { id, name: input.name, type: input.type, icon, color, createdAt }
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const name = input.name ?? existing.name
    const type = input.type ?? existing.type
    const icon = input.icon ?? existing.icon
    const color = input.color ?? existing.color
    await this.db
      .prepare('UPDATE categories SET name = ?, type = ?, icon = ?, color = ? WHERE id = ?')
      .bind(name, type, icon, color, id)
      .run()
    return { ...existing, name, type, icon, color }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }
}
