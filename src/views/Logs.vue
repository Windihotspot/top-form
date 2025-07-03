<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
const loading = ref(false)
const logs = ref([])
const selectedEvent = ref('jobs.fetched') // Default filter
import moment from 'moment'
const searchQuery = ref('')
const dateRange = ref([])

const formatDateTime = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss')

// Fetch logs
const fetchLogs = async () => {
  loading.value = true
  console.log('event:', selectedEvent.value)
  try {
    const response = await api.get('/get-logs', {
      params: {
        event: selectedEvent.value
      }
    })

    console.log('logs:', response.data.data.data)
    logs.value = response.data.data.data
  } catch (error) {
    console.log('Failed to fetch logs:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})

// Computed filtered logs
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
            label="Filter"
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
        <v-table class="bg-white rounded">
          <thead>
            <tr class="text-left text-sm font-bold border-b">
              <th class="py-3 px-4">Date</th>
              <th class="py-3 px-4">User</th>
              <th class="py-3 px-4">Event</th>
              <th class="py-3 px-4">IP address</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(log, index) in filteredLogs" :key="index" class="border-b last:border-b-0 text-sm">
              <td class="py-3 px-4">
                {{ formatDateTime(log.created_at) }}
              </td>
              <td class="py-3 px-4">{{ log.user_id }}</td>
              <td class="py-3 px-4">{{ log.event }}</td>
              <td class="py-3 px-4">{{ log.ip_address }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </MainLayout>
</template>
