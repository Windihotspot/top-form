<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/api'
import moment from 'moment'

const loading = ref(false)
const logs = ref([])
const selectedEvent = ref('jobs.fetched')
const searchQuery = ref('')
const dateRange = ref([])

// Pagination
const totalItems = ref(0)
const currentPage = ref(1)

const itemsPerPageOptions = [15, 25, 50, 100]
const itemsPerPage = ref(15) // Default

// Format date
const formatDateTime = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss')

// Total pages
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

// Dynamic pagination buttons
const pagesToShow = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

// Fetch logs from API
const fetchLogs = async () => {
  loading.value = true
  try {
    const response = await api.get('/get-logs', {
      params: {
        event: selectedEvent.value,
        page: currentPage.value,
        per_page: itemsPerPage.value,
        search: searchQuery.value,
        start_date: dateRange.value?.[0],
        end_date: dateRange.value?.[1]
      }
    })
    console.log('logs response:', response)
    const data = response.data.data.data
    console.log('logs data:', data)
    logs.value = data // Actual records
    totalItems.value = data.total // For pagination
    itemsPerPage.value = data.per_page
  } catch (error) {
    console.error('Failed to fetch logs:', error)
  } finally {
    loading.value = false
  }
}

// Initial fetch
onMounted(() => {
  fetchLogs()
})

// Refetch on changes
watch([searchQuery, dateRange, currentPage, itemsPerPage], () => {
  fetchLogs()
})

// Optional local filtering (if needed)
const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    const matchesSearch =
      searchQuery.value === '' ||
      log.event?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.user_id?.toString().includes(searchQuery.value) ||
      log.ip_address?.includes(searchQuery.value)

    const matchesDate =
      dateRange.value.length === 0 ||
      (moment(log.created_at).isSameOrAfter(dateRange.value[0], 'day') &&
        moment(log.created_at).isSameOrBefore(dateRange.value[1], 'day'))

    return matchesSearch && matchesDate
  })
})
</script>

<template>
  <MainLayout>
    <!-- Title -->
    <div class="p-4 rounded shadow bg-white m-4">
      <!-- Title -->
      <div class="mb-2">
        <h1 class="text-lg font-bold">Logs</h1>
      </div>

      <div class="flex items-center justify-between p-2">
        <!-- Filter (Vuetify Select) -->
        <div class="flex items-center space-x-2 pt-2">
          <i class="fa-solid fa-filter"></i>

          <v-select
            color="#1f5aa3"
            label="Filter by event"
            density="compact"
            hide-details
            variant="outlined"
            class="w-32 min-h-0 h-8 text-sm"
          ></v-select>
        </div>

        <!-- Search -->
        <v-text-field
          rounded
          v-model="searchQuery"
          placeholder="Search for a log"
          density="compact"
          hide-details
          variant="outlined"
          class="max-w-xs rounded-md"
          label="Search"
          color="#1f5aa3"
        >
          <template #append-inner>
            <i class="fas fa-search text-[#1f5aa3]"></i>
          </template>
        </v-text-field>
      </div>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        start-placeholder="Start date"
        end-placeholder="End date"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        class="m-4"
        size="small"
      />
    </div>

    <div class="p-2">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center min-h-[200px]">
        <v-progress-circular indeterminate color="#1f5aa3" size="80" width="8" />
        <span class="mt-2 text-gray-600 text-sm">Loading logs...</span>
      </div>

      <div v-else class="overflow-y-auto">
        <div class="p-2">
          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center min-h-[200px]">
            <v-progress-circular indeterminate color="#1f5aa3" size="80" width="8" />
            <span class="mt-2 text-gray-600 text-sm">Loading logs...</span>
          </div>

          <div v-else>
            <div class="overflow-auto bg-white rounded">
              <table class="min-w-full table-auto border-collapse">
                <thead>
                  <tr class="bg-gray-100 text-left text-sm font-semibold">
                    <th class="p-3 border-b">Date</th>
                    <th class="p-3 border-b">User</th>
                    <th class="p-3 border-b">Event</th>
                    <th class="p-3 border-b">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 text-sm">
                    <td class="p-3 border-b">{{ formatDateTime(log.created_at) }}</td>
                    <td class="p-3 border-b">{{ log.user_id }}</td>
                    <td class="p-3 border-b">{{ log.event }}</td>
                    <td class="p-3 border-b">{{ log.ip_address }}</td>
                  </tr>
                  <tr v-if="logs.length === 0">
                    <td colspan="4" class="text-center p-4 text-gray-500">No logs found</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <!-- Tailwind Pagination -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
              <!-- Items per page -->
              <!-- Vuetify Items Per Page Dropdown -->
              <div class="flex items-center space-x-2">
                <label class="text-sm text-gray-700">Items per page:</label>
                  <v-select
              v-model="itemsPerPage"
              :items="itemsPerPageOptions"
              hide-details
              density="compact"
              variant="outlined"
              class="w-18 text-sm"
              placeholder="Per page"
            />
              </div>

              <!-- Pagination controls -->
              <div class="inline-flex items-center gap-4 flex-wrap text-sm">
                <!-- First -->
                <button
                  @click="currentPage = 1"
                  :disabled="currentPage === 1"
                  class="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                  title="First Page"
                >
                  <i class="fas fa-angles-left"></i>
                </button>

                <!-- Prev -->
                <button
                  @click="currentPage = Math.max(currentPage - 1, 1)"
                  :disabled="currentPage === 1"
                  class="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                  title="Previous Page"
                >
                  <i class="fas fa-angle-left"></i>
                </button>

                <!-- Page numbers with dots -->
                <button
                  v-for="page in pagesToShow"
                  :key="page"
                  @click="typeof page === 'number' && (currentPage = page)"
                  :disabled="page === '...'"
                  class="px-2 py-1 border rounded hover:bg-gray-100"
                  :class="{
                    'bg-blue-600 text-white': page === currentPage,
                    'opacity-60 cursor-default': page === '...'
                  }"
                >
                  {{ page }}
                </button>

                <!-- Next -->
                <button
                  @click="currentPage = Math.min(currentPage + 1, totalPages)"
                  :disabled="currentPage === totalPages"
                  class="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                  title="Next Page"
                >
                  <i class="fas fa-angle-right"></i>
                </button>

                <!-- Last -->
                <button
                  @click="currentPage = totalPages"
                  :disabled="currentPage === totalPages"
                  class="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                  title="Last Page"
                >
                  <i class="fas fa-angles-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
