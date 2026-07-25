export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  note: string
  date: string
  createdAt: string
}

export interface CreateTransactionInput {
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  note?: string
  date?: string
}

export interface UpdateTransactionInput {
  amount?: number
  type?: 'income' | 'expense'
  categoryId?: string
  note?: string
  date?: string
}
