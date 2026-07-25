<script setup lang="ts">
import { useCategoryStore } from '@/stores/use-category-store'
import { useTransactionStore } from '@/stores/use-transaction-store'
import type { CreateTransactionBody, Transaction, UpdateTransactionBody } from '@/models'

const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()

const { categories } = storeToRefs(categoryStore)
const { transactions, isLoading, error, totalIncome, totalExpense, balance } = storeToRefs(transactionStore)

const typeFilter = ref<'all' | 'income' | 'expense'>('all')
const dateStart = ref('')
const dateEnd = ref('')

const filteredTransactions = computed(() => {
  let items = transactions.value
  if (typeFilter.value !== 'all') {
    items = items.filter(t => t.type === typeFilter.value)
  }
  return items
})

const headers = [
  { title: 'วันที่', key: 'date' },
  { title: 'ประเภท', key: 'type' },
  { title: 'จำนวนเงิน', key: 'amount' },
  { title: 'หมวดหมู่', key: 'categoryId' },
  { title: 'หมายเหตุ', key: 'note' },
  { title: 'Action', key: 'action', sortable: false, align: 'end' as const },
]

const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const deletingTransaction = ref<Transaction | null>(null)

const form = ref<CreateTransactionBody & { categoryName?: string }>({
  amount: 0,
  type: 'expense',
  categoryId: '',
  note: '',
  date: new Date().toISOString().slice(0, 10),
})

const incomeCategories = computed(() => categories.value.filter(c => c.type === 'income'))
const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'))
const filteredFormCategories = computed(() =>
  form.value.type === 'income' ? incomeCategories.value : expenseCategories.value
)

function openCreate() {
  editingTransaction.value = null
  form.value = {
    amount: 0,
    type: 'expense',
    categoryId: expenseCategories.value[0]?.id ?? '',
    note: '',
    date: new Date().toISOString().slice(0, 10),
  }
  dialog.value = true
}

function openEdit(transaction: Transaction) {
  editingTransaction.value = transaction
  form.value = {
    amount: transaction.amount,
    type: transaction.type,
    categoryId: transaction.categoryId,
    note: transaction.note,
    date: transaction.date,
  }
  dialog.value = true
}

function openDelete(transaction: Transaction) {
  deletingTransaction.value = transaction
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingTransaction.value)
      await transactionStore.updateTransaction(editingTransaction.value.id, form.value)
    else
      await transactionStore.createTransaction(form.value as CreateTransactionBody)
    dialog.value = false
    await refresh()
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingTransaction.value) return
  isSubmitting.value = true
  try {
    await transactionStore.deleteTransaction(deletingTransaction.value.id)
    deleteDialog.value = false
    await refresh()
  } finally {
    isSubmitting.value = false
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

function getCategory(id: string) {
  return categories.value.find(c => c.id === id)
}

async function refresh() {
  if (dateStart.value && dateEnd.value) {
    await transactionStore.fetchSummary(dateStart.value, dateEnd.value)
  } else {
    await transactionStore.fetchSummary()
    await transactionStore.fetchTransactions(typeFilter.value === 'all' ? undefined : typeFilter.value)
  }
}

watch(typeFilter, () => refresh())

onMounted(async () => {
  await categoryStore.fetchCategories()
  await refresh()
})
</script>

<template>
  <div>
    <!-- Summary Cards -->
    <VRow class="mb-4">
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-arrow-up-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">รายรับทั้งหมด</div>
              <div class="text-h5 font-weight-bold text-success">
                {{ formatCurrency(totalIncome) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="error" variant="tonal" size="48">
              <VIcon icon="ri-arrow-down-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">รายจ่ายทั้งหมด</div>
              <div class="text-h5 font-weight-bold text-error">
                {{ formatCurrency(totalExpense) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar :color="balance >= 0 ? 'info' : 'warning'" variant="tonal" size="48">
              <VIcon icon="ri-wallet-3-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">คงเหลือ</div>
              <div class="text-h5 font-weight-bold" :class="balance >= 0 ? 'text-info' : 'text-warning'">
                {{ formatCurrency(balance) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">รายการทั้งหมด</span>
        <div class="d-flex gap-2 align-center">
          <VTextField
            v-model="dateStart"
            type="date"
            density="compact"
            variant="outlined"
            label="จากวันที่"
            hide-details
            class="w-36"
          />
          <VTextField
            v-model="dateEnd"
            type="date"
            density="compact"
            variant="outlined"
            label="ถึงวันที่"
            hide-details
            class="w-36"
          />
          <VBtnToggle v-model="typeFilter" density="compact" variant="outlined" color="primary" divided>
            <VBtn value="all" size="small">ทั้งหมด</VBtn>
            <VBtn value="income" size="small">รายรับ</VBtn>
            <VBtn value="expense" size="small">รายจ่าย</VBtn>
          </VBtnToggle>
          <VBtn color="primary" prepend-icon="ri-add-line" @click="openCreate">
            เพิ่มรายการ
          </VBtn>
        </div>
      </VCardTitle>

      <VDivider />

      <VAlert v-if="error" type="error" class="ma-4" :text="error" closable />

      <VDataTable
        :headers="headers"
        :items="filteredTransactions"
        :loading="isLoading"
        hover
      >
        <template #item.type="{ item }">
          <VChip
            :color="item.type === 'income' ? 'success' : 'error'"
            size="small"
          >
            {{ item.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}
          </VChip>
        </template>

        <template #item.amount="{ item }">
          <span :class="item.type === 'income' ? 'text-success' : 'text-error'" class="font-weight-bold">
            {{ item.type === 'income' ? '+' : '-' }} {{ formatCurrency(item.amount) }}
          </span>
        </template>

        <template #item.categoryId="{ item }">
          <VIcon
            v-if="getCategory(item.categoryId)"
            :color="getCategory(item.categoryId)!.color"
            size="small"
            class="me-1"
          >
            {{ getCategory(item.categoryId)!.icon }}
          </VIcon>
          {{ getCategory(item.categoryId)?.name ?? '—' }}
        </template>

        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
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
            ยังไม่มีรายการ กด "เพิ่มรายการ" เพื่อบันทึก
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="520" persistent>
      <VCard :title="editingTransaction ? 'แก้ไขรายการ' : 'เพิ่มรายการ'">
        <VCardText>
          <VForm @submit.prevent="submit">
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
              @update:model-value="form.categoryId = filteredFormCategories[0]?.id ?? ''"
            />
            <VTextField
              v-model="form.amount"
              label="จำนวนเงิน (บาท)"
              type="number"
              prepend-inner-icon="ri-money-dollar-circle-line"
              class="mb-4"
              min="1"
              required
            />
            <VSelect
              v-model="form.categoryId"
              label="หมวดหมู่"
              :items="filteredFormCategories.map(c => ({ title: c.name, value: c.id }))"
              prepend-inner-icon="ri-price-tag-3-line"
              class="mb-4"
              required
            />
            <VTextField
              v-model="form.date"
              label="วันที่"
              type="date"
              prepend-inner-icon="ri-calendar-line"
              class="mb-4"
              required
            />
            <VTextField
              v-model="form.note"
              label="หมายเหตุ"
              prepend-inner-icon="ri-file-text-line"
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">ยกเลิก</VBtn>
          <VBtn color="primary" :loading="isSubmitting" @click="submit">
            {{ editingTransaction ? 'บันทึก' : 'สร้าง' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="ลบรายการ">
        <VCardText>
          แน่ใจหรือว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">ยกเลิก</VBtn>
          <VBtn color="error" :loading="isSubmitting" @click="confirmDelete">ลบ</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
