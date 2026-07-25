import type {
  CreateTransactionBody,
  SummaryResponse,
  TransactionListResponse,
  TransactionResponse,
  UpdateTransactionBody,
} from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/transactions`

export const transactionApi = {
  list: (type?: 'income' | 'expense') =>
    request<TransactionListResponse>(type ? `${BASE}?type=${type}` : BASE),
  get: (id: string) => request<TransactionResponse>(`${BASE}/${id}`),
  summary: (start?: string, end?: string) => {
    const params = new URLSearchParams()
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    const qs = params.toString()
    return request<SummaryResponse>(qs ? `${BASE}/summary?${qs}` : `${BASE}/summary`)
  },
  create: (body: CreateTransactionBody) =>
    request<TransactionResponse>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateTransactionBody) =>
    request<TransactionResponse>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
