import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

interface TransactionRow {
  id: string
  amount: number
  type: string
  category_id: string
  note: string
  date: string
  created_at: string
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    type: row.type as 'income' | 'expense',
    categoryId: row.category_id,
    note: row.note,
    date: row.date,
    createdAt: row.created_at,
  }
}

export class D1TransactionRepository implements TransactionRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(type?: 'income' | 'expense'): Promise<Transaction[]> {
    let query = 'SELECT id, amount, type, category_id, note, date, created_at FROM transactions'
    const params: unknown[] = []

    if (type) {
      query += ' WHERE type = ?'
      params.push(type)
    }
    query += ' ORDER BY date DESC, created_at DESC'

    const { results } = await this.db.prepare(query).bind(...params).all<TransactionRow>()
    return results.map(toTransaction)
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.db
      .prepare('SELECT id, amount, type, category_id, note, date, created_at FROM transactions WHERE id = ?')
      .bind(id)
      .first<TransactionRow>()
    return row ? toTransaction(row) : null
  }

  async findByDateRange(start: string, end: string): Promise<Transaction[]> {
    const { results } = await this.db
      .prepare(
        'SELECT id, amount, type, category_id, note, date, created_at FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC, created_at DESC'
      )
      .bind(start, end)
      .all<TransactionRow>()
    return results.map(toTransaction)
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const note = input.note ?? ''
    const date = input.date ?? new Date().toISOString().slice(0, 10)
    await this.db
      .prepare('INSERT INTO transactions (id, amount, type, category_id, note, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.amount, input.type, input.categoryId, note, date, createdAt)
      .run()
    return { id, amount: input.amount, type: input.type, categoryId: input.categoryId, note, date, createdAt }
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const amount = input.amount ?? existing.amount
    const type = input.type ?? existing.type
    const categoryId = input.categoryId ?? existing.categoryId
    const note = input.note ?? existing.note
    const date = input.date ?? existing.date
    await this.db
      .prepare('UPDATE transactions SET amount = ?, type = ?, category_id = ?, note = ?, date = ? WHERE id = ?')
      .bind(amount, type, categoryId, note, date, id)
      .run()
    return { ...existing, amount, type, categoryId, note, date }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM transactions WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }
}
