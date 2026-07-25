import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

export class MemoryTransactionRepository implements TransactionRepository {
  private readonly items = new Map<string, Transaction>()

  async findAll(type?: 'income' | 'expense'): Promise<Transaction[]> {
    const all = [...this.items.values()]
    if (type) return all.filter((t) => t.type === type)
    return all
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.items.get(id) ?? null
  }

  async findByDateRange(start: string, end: string): Promise<Transaction[]> {
    return [...this.items.values()].filter((t) => t.date >= start && t.date <= end)
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const item: Transaction = {
      id: crypto.randomUUID(),
      amount: input.amount,
      type: input.type,
      categoryId: input.categoryId,
      note: input.note ?? '',
      date: input.date ?? new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    }
    this.items.set(item.id, item)
    return item
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = this.items.get(id)
    if (!existing) return null
    const updated: Transaction = {
      ...existing,
      amount: input.amount ?? existing.amount,
      type: input.type ?? existing.type,
      categoryId: input.categoryId ?? existing.categoryId,
      note: input.note ?? existing.note,
      date: input.date ?? existing.date,
    }
    this.items.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id)
  }
}
