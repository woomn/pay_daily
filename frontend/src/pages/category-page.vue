<script setup lang="ts">
import { useCategoryStore } from '@/stores/use-category-store'
import type { Category, CreateCategoryBody, UpdateCategoryBody } from '@/models'

const categoryStore = useCategoryStore()
const { categories, isLoading, error } = storeToRefs(categoryStore)

const typeFilter = ref<'all' | 'income' | 'expense'>('all')

const filteredCategories = computed(() => {
  if (typeFilter.value === 'all') return categories.value
  return categories.value.filter(c => c.type === typeFilter.value)
})

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Icon', key: 'icon' },
  { title: 'Created At', key: 'createdAt' },
  { title: 'Action', key: 'action', sortable: false, align: 'end' as const },
]

const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingCategory = ref<Category | null>(null)
const deletingCategory = ref<Category | null>(null)

const form = ref<CreateCategoryBody & UpdateCategoryBody>({ name: '', type: 'expense', icon: 'mdi-help-circle', color: '#808080' })

function openCreate() {
  editingCategory.value = null
  form.value = { name: '', type: 'expense', icon: 'mdi-help-circle', color: '#808080' }
  dialog.value = true
}

function openEdit(category: Category) {
  editingCategory.value = category
  form.value = { name: category.name, type: category.type, icon: category.icon, color: category.color }
  dialog.value = true
}

function openDelete(category: Category) {
  deletingCategory.value = category
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingCategory.value)
      await categoryStore.updateCategory(editingCategory.value.id, form.value)
    else
      await categoryStore.createCategory(form.value as CreateCategoryBody)
    dialog.value = false
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingCategory.value) return
  isSubmitting.value = true
  try {
    await categoryStore.deleteCategory(deletingCategory.value.id)
    deleteDialog.value = false
  } finally {
    isSubmitting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

onMounted(() => categoryStore.fetchCategories())

const presets = [
  { icon: 'mdi-briefcase', color: '#4CAF50' },
  { icon: 'mdi-food', color: '#FF5722' },
  { icon: 'mdi-car', color: '#FF9800' },
  { icon: 'mdi-home', color: '#9C27B0' },
  { icon: 'mdi-lightning-bolt', color: '#F44336' },
  { icon: 'mdi-cart', color: '#607D8B' },
  { icon: 'mdi-movie', color: '#E91E63' },
  { icon: 'mdi-heart', color: '#00BCD4' },
  { icon: 'mdi-school', color: '#3F51B5' },
  { icon: 'mdi-piggy-bank', color: '#795548' },
]
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex responsive-header justify-space-between pa-4">
        <span class="text-h6 mb-sm-0">หมวดหมู่รายรับ/รายจ่าย</span>
        <div class="d-flex gap-2 flex-wrap filter-group">
          <VBtnToggle v-model="typeFilter" density="compact" variant="outlined" color="primary" divided>
            <VBtn value="all" size="small">ทั้งหมด</VBtn>
            <VBtn value="income" size="small">รายรับ</VBtn>
            <VBtn value="expense" size="small">รายจ่าย</VBtn>
          </VBtnToggle>
          <VBtn color="primary" prepend-icon="ri-add-line" @click="openCreate">
            เพิ่มหมวดหมู่
          </VBtn>
        </div>
      </VCardTitle>

      <VDivider />

      <VAlert v-if="error" type="error" class="ma-4" :text="error" closable />

      <VDataTable
        :headers="headers"
        :items="filteredCategories"
        :loading="isLoading"
        hover
        style="table-layout: fixed;"
      >
        <template #item.type="{ item }">
          <VChip
            :color="item.type === 'income' ? 'success' : 'error'"
            size="small"
          >
            {{ item.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}
          </VChip>
        </template>

        <template #item.icon="{ item }">
          <VIcon :color="item.color">{{ item.icon }}</VIcon>
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #item.action="{ item }">
          <IconBtn @click="openEdit(item)">
            <VTooltip activator="parent" location="top">แก้ไข</VTooltip>
            <VIcon icon="ri-pencil-line" />
          </IconBtn>
          <IconBtn color="error" @click="openDelete(item)">
            <VTooltip activator="parent" location="top">ลบ</VTooltip>
            <VIcon icon="ri-delete-bin-line" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            ยังไม่มีหมวดหมู่ กด "เพิ่มหมวดหมู่" เพื่อสร้าง
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="520" persistent>
      <VCard :title="editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VTextField
              v-model="form.name"
              label="ชื่อหมวดหมู่"
              prepend-inner-icon="ri-price-tag-3-line"
              class="mb-4"
              required
            />
            <VSelect
              v-model="form.type"
              label="ประเภท"
              :items="[
                { title: 'รายรับ', value: 'income' },
                { title: 'รายจ่าย', value: 'expense' },
              ]"
              prepend-inner-icon="ri-arrow-up-down-line"
              class="mb-4"
              required
            />
            <label class="text-caption text-medium-emphasis d-block mb-1">เลือกสีและไอคอน</label>
            <div class="d-flex flex-wrap gap-2 mb-4">
              <div
                v-for="preset in presets"
                :key="preset.icon"
                class="pa-2 rounded cursor-pointer"
                :class="{ 'border border-primary': form.icon === preset.icon }"
                :style="{ background: `${preset.color}20` }"
                @click="form.icon = preset.icon; form.color = preset.color"
              >
                <VIcon :color="preset.color">{{ preset.icon }}</VIcon>
              </div>
            </div>
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">ยกเลิก</VBtn>
          <VBtn color="primary" :loading="isSubmitting" @click="submit">
            {{ editingCategory ? 'บันทึก' : 'สร้าง' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="ลบหมวดหมู่">
        <VCardText>
          แน่ใจหรือว่าต้องการลบ <strong>{{ deletingCategory?.name }}</strong>? การกระทำนี้ไม่สามารถย้อนกลับได้
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">ยกเลิก</VBtn>
          <VBtn color="error" :loading="isSubmitting" @click="confirmDelete">ลบ</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
