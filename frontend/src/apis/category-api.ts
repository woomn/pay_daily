import type { CategoryListResponse, CategoryResponse, CreateCategoryBody, UpdateCategoryBody } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/categories`

export const categoryApi = {
  list: (type?: 'income' | 'expense') =>
    request<CategoryListResponse>(type ? `${BASE}?type=${type}` : BASE),
  get: (id: string) => request<CategoryResponse>(`${BASE}/${id}`),
  create: (body: CreateCategoryBody) =>
    request<CategoryResponse>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateCategoryBody) =>
    request<CategoryResponse>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
