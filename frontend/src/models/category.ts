export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  createdAt: string
}

export interface CreateCategoryBody {
  name: string
  type: 'income' | 'expense'
  icon?: string
  color?: string
}

export interface UpdateCategoryBody {
  name?: string
  type?: 'income' | 'expense'
  icon?: string
  color?: string
}

export interface CategoryListResponse {
  data: Category[]
}

export interface CategoryResponse {
  data: Category
}
