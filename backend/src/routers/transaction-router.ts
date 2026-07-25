import { Hono } from 'hono'
import { describeRoute, resolver } from 'hono-openapi'
import {
  createTransactionSchema,
  idParamSchema,
  summaryResponseSchema,
  transactionListResponseSchema,
  transactionResponseSchema,
  updateTransactionSchema,
} from '../schemas/transaction-schemas'
import { errorResponseSchema } from '../schemas/user-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createTransactionRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/',
    describeRoute({
      tags: ['Transactions'],
      summary: 'List all transactions',
      description: 'Filter by ?type=income or ?type=expense',
      responses: {
        200: { description: 'All transactions', content: jsonContent(transactionListResponseSchema) },
      },
    }),
    (c) => c.get('container').transactionHandler.list(c)
  )

  router.get(
    '/summary',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Get income/expense summary',
      description: 'Optional ?start=YYYY-MM-DD&end=YYYY-MM-DD for date range',
      responses: {
        200: { description: 'Summary', content: jsonContent(summaryResponseSchema) },
      },
    }),
    (c) => c.get('container').transactionHandler.summary(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Create a transaction',
      responses: {
        201: { description: 'Transaction created', content: jsonContent(transactionResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Category not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').transactionHandler.create(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Get a transaction by id',
      responses: {
        200: { description: 'Transaction found', content: jsonContent(transactionResponseSchema) },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').transactionHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Update a transaction',
      responses: {
        200: { description: 'Transaction updated', content: jsonContent(transactionResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').transactionHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Delete a transaction',
      responses: {
        204: { description: 'Transaction deleted' },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').transactionHandler.delete(c)
  )

  return router
}
