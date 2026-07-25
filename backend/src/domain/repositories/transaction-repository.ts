import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../entities/transaction'

export interface TransactionRepository {
  findAll(type?: 'income' | 'expense'): Promise<Transaction[]>
  findById(id: string): Promise<Transaction | null>
  findByDateRange(start: string, end: string): Promise<Transaction[]>
  create(input: CreateTransactionInput): Promise<Transaction>
  update(id: string, input: UpdateTransactionInput): Promise<Transaction | null>
  delete(id: string): Promise<boolean>
}
