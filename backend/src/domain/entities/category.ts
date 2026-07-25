export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  createdAt: string
}

export interface CreateCategoryInput {
  name: string
  type: 'income' | 'expense'
  icon?: string
  color?: string
}

export interface UpdateCategoryInput {
  name?: string
  type?: 'income' | 'expense'
  icon?: string
  color?: string
}
