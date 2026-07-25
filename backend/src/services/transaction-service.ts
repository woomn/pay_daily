import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../domain/entities/transaction'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { CategoryRepository } from '../domain/repositories/category-repository'
import type { TransactionRepository } from '../domain/repositories/transaction-repository'

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async listTransactions(type?: 'income' | 'expense'): Promise<Transaction[]> {
    return this.transactionRepository.findAll(type)
  }

  async getTransaction(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) throw new NotFoundError('Transaction')
    return transaction
  }

  async getSummary(start?: string, end?: string): Promise<{
    totalIncome: number
    totalExpense: number
    balance: number
    transactions: Transaction[]
  }> {
    const transactions = start && end
      ? await this.transactionRepository.findByDateRange(start, end)
      : await this.transactionRepository.findAll()

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, transactions }
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    if (input.amount <= 0) throw new ValidationError('amount must be positive')
    if (input.type !== 'income' && input.type !== 'expense') {
      throw new ValidationError('type must be "income" or "expense"')
    }
    const category = await this.categoryRepository.findById(input.categoryId)
    if (!category) throw new NotFoundError('Category')
    if (category.type !== input.type) {
      throw new ValidationError('category type does not match transaction type')
    }
    return this.transactionRepository.create(input)
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    if (input.amount !== undefined && input.amount <= 0) {
      throw new ValidationError('amount must be positive')
    }
    if (input.categoryId) {
      const category = await this.categoryRepository.findById(input.categoryId)
      if (!category) throw new NotFoundError('Category')
    }
    const updated = await this.transactionRepository.update(id, input)
    if (!updated) throw new NotFoundError('Transaction')
    return updated
  }

  async deleteTransaction(id: string): Promise<void> {
    const deleted = await this.transactionRepository.delete(id)
    if (!deleted) throw new NotFoundError('Transaction')
  }
}
