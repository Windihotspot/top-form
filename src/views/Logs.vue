<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
const loading = ref(false)
const logs = ref([])
const selectedEvent = ref('jobs.fetched') // Default filter
import moment from 'moment'

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
</script>

<template>
  <MainLayout>
    <!-- Title -->
    <div class="mb-2 border-b p-4">
      <h1 class="text-2xl font-bold text-gray-900">Activity Logs</h1>
    </div>
    <div class="m-2 flex items-center justify-between pa-4 bg-white rounded">
      <!-- Filter (Vuetify Select) -->
      <div class="flex items-center space-x-4 pt-2">
        <!-- Filter Icon -->
        <i class="fa-solid fa-filter"></i>

        <v-select
          color="[#1f5aa3]"
          label="Status"
          density="compact"
          hide-details
          variant="outlined"
          class="w-32"
        ></v-select>
      </div>

      <v-text-field
        rounded
        placeholder="Search for a transaction"
        density="compact"
        hide-details
        variant="outlined"
        class="max-w-xs rounded-md"
        label="Search"
        color="[#1f5aa3]"
        append-inner-icon=""
      >
        <!-- FontAwesome Search Icon inside append-inner slot -->
        <template #append-inner>
          <i class="fas fa-search text-[#1f5aa3]"></i>
        </template>
      </v-text-field>

       
    </div>
    <el-date-picker
      type="daterange"
      range-separator="to"
      start-placeholder="Start date"
      end-placeholder="End date"
      class="w-20 m-2"
      size="small"
    ></el-date-picker>

   

    <div class="p-2">
      <v-table class="bg-white rounded">
        <thead>
          <tr class="text-left text-sm text-gray-700 border-b">
            <th class="py-3 px-4">Date</th>
            <th class="py-3 px-4">User</th>
            <th class="py-3 px-4">Event</th>
            <th class="py-3 px-4">IP address</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in logs" :key="index" class="border-b last:border-b-0 text-sm">
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
  </MainLayout>
</template>
