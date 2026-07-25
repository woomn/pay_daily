import z from 'zod'

export const transactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().uuid(),
  note: z.string(),
  date: z.string(),
  createdAt: z.string().datetime(),
})

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().uuid(),
  note: z.string().optional(),
  date: z.string().optional(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const summarySchema = z.object({
  totalIncome: z.number(),
  totalExpense: z.number(),
  balance: z.number(),
  transactions: z.array(transactionSchema),
})

export const transactionResponseSchema = z.object({ data: transactionSchema })
export const transactionListResponseSchema = z.object({ data: z.array(transactionSchema) })
export const summaryResponseSchema = z.object({ data: summarySchema })
