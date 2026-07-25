<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useSEO } from '@/composables/useSEO'
import { useTransactionStore } from '@/stores/use-transaction-store'
import { useCategoryStore } from '@/stores/use-category-store'

useSEO({
  title: 'Dashboard - ngernngern_thongthong',
  description: 'ภาพรวมรายรับรายจ่ายส่วนตัว',
  keywords: ['การเงิน', 'รายรับ', 'รายจ่าย', 'งบประมาณ', 'pay-daily'],
})

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()

const { totalIncome, totalExpense, balance, transactions } = storeToRefs(transactionStore)
const recentTransactions = computed(() => transactions.value.slice(0, 5))

const thisMonth = ref(new Date().toISOString().slice(0, 7))
const currentMonthLabel = computed(() => {
  const [y, m] = thisMonth.value.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

function getCategory(id: string) {
  return categoryStore.categories.find(c => c.id === id)
}

async function loadMonth() {
  const start = `${thisMonth.value}-01`
  const endDate = new Date(Number(thisMonth.value.split('-')[0]), Number(thisMonth.value.split('-')[1]), 0)
  const end = endDate.toISOString().slice(0, 10)
  await transactionStore.fetchSummary(start, end)
}

watch(thisMonth, loadMonth)

onMounted(async () => {
  await categoryStore.fetchCategories()
  await loadMonth()
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">ภาพรวมการเงิน</h1>
      <div class="d-flex align-center gap-2">
        <VTextField
          v-model="thisMonth"
          type="month"
          density="compact"
          variant="outlined"
          hide-details
          class="w-40"
        />
        <span class="text-body-1 text-medium-emphasis">{{ currentMonthLabel }}</span>
      </div>
    </div>

    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText>
            <div class="d-flex align-center gap-3 mb-2">
              <VAvatar color="success" variant="tonal" size="48">
                <VIcon icon="ri-arrow-up-line" size="24" />
              </VAvatar>
              <div>
                <div class="text-caption text-medium-emphasis">รายรับ</div>
                <div class="text-h4 font-weight-bold text-success">{{ formatCurrency(totalIncome) }}</div>
              </div>
            </div>
            <VProgressLinear :model-value="100" color="success" height="4" rounded />
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="4">
        <VCard>
          <VCardText>
            <div class="d-flex align-center gap-3 mb-2">
              <VAvatar color="error" variant="tonal" size="48">
                <VIcon icon="ri-arrow-down-line" size="24" />
              </VAvatar>
              <div>
                <div class="text-caption text-medium-emphasis">รายจ่าย</div>
                <div class="text-h4 font-weight-bold text-error">{{ formatCurrency(totalExpense) }}</div>
              </div>
            </div>
            <VProgressLinear :model-value="100" color="error" height="4" rounded />
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="4">
        <VCard>
          <VCardText>
            <div class="d-flex align-center gap-3 mb-2">
              <VAvatar :color="balance >= 0 ? 'info' : 'warning'" variant="tonal" size="48">
                <VIcon icon="ri-wallet-3-line" size="24" />
              </VAvatar>
              <div>
                <div class="text-caption text-medium-emphasis">คงเหลือ</div>
                <div class="text-h4 font-weight-bold" :class="balance >= 0 ? 'text-info' : 'text-warning'">
                  {{ formatCurrency(balance) }}
                </div>
              </div>
            </div>
            <VProgressLinear
              :model-value="totalIncome > 0 ? Math.round(totalExpense / totalIncome * 100) : 0"
              :color="balance >= 0 ? 'info' : 'warning'"
              height="4"
              rounded
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12" md="8">
        <VCard>
          <VCardTitle class="pa-4">
            <span class="text-h6">รายการล่าสุด</span>
          </VCardTitle>
          <VDivider />
          <VList>
            <VListItem
              v-for="t in recentTransactions"
              :key="t.id"
              class="border-b-sm"
            >
              <template #prepend>
                <VIcon
                  v-if="getCategory(t.categoryId)"
                  :color="getCategory(t.categoryId)!.color"
                >
                  {{ getCategory(t.categoryId)!.icon }}
                </VIcon>
              </template>
              <VListItemTitle class="font-weight-medium">
                {{ getCategory(t.categoryId)?.name ?? '—' }}
              </VListItemTitle>
              <VListItemSubtitle>
                {{ formatDate(t.date) }} · {{ t.note || 'ไม่มีหมายเหตุ' }}
              </VListItemSubtitle>
              <template #append>
                <span
                  class="font-weight-bold"
                  :class="t.type === 'income' ? 'text-success' : 'text-error'"
                >
                  {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                </span>
              </template>
            </VListItem>
            <VListItem v-if="recentTransactions.length === 0">
              <VListItemTitle class="text-center text-disabled pa-4">
                ยังไม่มีรายการในเดือนนี้
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard>
          <VCardTitle class="pa-4">
            <span class="text-h6">สรุปประจำเดือน</span>
          </VCardTitle>
          <VDivider />
          <VCardText class="pa-4">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-medium-emphasis">รายรับ</span>
              <span class="font-weight-bold text-success">{{ formatCurrency(totalIncome) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-medium-emphasis">รายจ่าย</span>
              <span class="font-weight-bold text-error">{{ formatCurrency(totalExpense) }}</span>
            </div>
            <VDivider class="my-2" />
            <div class="d-flex justify-space-between">
              <span class="font-weight-bold">คงเหลือ</span>
              <span
                class="font-weight-bold"
                :class="balance >= 0 ? 'text-info' : 'text-warning'"
              >
                {{ formatCurrency(balance) }}
              </span>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
