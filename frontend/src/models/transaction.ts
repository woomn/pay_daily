export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  note: string
  date: string
  createdAt: string
}

export interface CreateTransactionBody {
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  note?: string
  date?: string
}

export interface UpdateTransactionBody {
  amount?: number
  type?: 'income' | 'expense'
  categoryId?: string
  note?: string
  date?: string
}

export interface TransactionListResponse {
  data: Transaction[]
}

export interface TransactionResponse {
  data: Transaction
}

export interface SummaryResponse {
  data: {
    totalIncome: number
    totalExpense: number
    balance: number
    transactions: Transaction[]
  }
}
