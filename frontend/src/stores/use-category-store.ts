import { defineStore } from 'pinia'
import { categoryApi } from '@/apis/category-api'
import type { Category, CreateCategoryBody, UpdateCategoryBody } from '@/models'

export const useCategoryStore = defineStore('CategoryStore', () => {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCategories(type?: 'income' | 'expense') {
    isLoading.value = true
    error.value = null
    try {
      const res = await categoryApi.list(type)
      categories.value = res.data
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(body: CreateCategoryBody) {
    const res = await categoryApi.create(body)
    categories.value.unshift(res.data)
    return res.data
  }

  async function updateCategory(id: string, body: UpdateCategoryBody) {
    const res = await categoryApi.update(id, body)
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) categories.value[idx] = res.data
    return res.data
  }

  async function deleteCategory(id: string) {
    await categoryApi.remove(id)
    categories.value = categories.value.filter(c => c.id !== id)
  }

  return { categories, isLoading, error, fetchCategories, createCategory, updateCategory, deleteCategory }
})
