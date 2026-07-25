import type { Context } from 'hono'
import type { CreateCategoryInput, UpdateCategoryInput } from '../domain/entities/category'
import { ValidationError } from '../domain/errors'
import type { CategoryService } from '../services/category-service'

export class CategoryHandler {
  constructor(private readonly categoryService: CategoryService) {}

  list = async (c: Context) => {
    const type = c.req.query('type') as 'income' | 'expense' | undefined
    const categories = await this.categoryService.listCategories(type)
    return c.json({ data: categories })
  }

  get = async (c: Context) => {
    const category = await this.categoryService.getCategory(this.param(c, 'id'))
    return c.json({ data: category })
  }

  create = async (c: Context) => {
    const body = await this.parseJson<CreateCategoryInput>(c)
    const category = await this.categoryService.createCategory(body)
    return c.json({ data: category }, 201)
  }

  update = async (c: Context) => {
    const body = await this.parseJson<UpdateCategoryInput>(c)
    const category = await this.categoryService.updateCategory(this.param(c, 'id'), body)
    return c.json({ data: category })
  }

  delete = async (c: Context) => {
    await this.categoryService.deleteCategory(this.param(c, 'id'))
    return c.body(null, 204)
  }

  private param(c: Context, name: string): string {
    const value = c.req.param(name)
    if (!value) throw new ValidationError(`${name} param is required`)
    return value
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
