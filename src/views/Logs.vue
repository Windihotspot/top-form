<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
const loading = ref(false)
const logs = ref([])
const selectedEvent = ref('jobs.fetched') // Default filter

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
    
    console.log('logs:', response.data.data)
    logs.value = response.data.data
  } catch (error) {
    console.log('Failed to fetch logs:', error)
  } finally {
    loading.value = false
  }
}

onMounted(()=>{
  fetchLogs()
})
</script>

<template>
  <MainLayout>
    <!-- Title -->
    <div class="mb-2 border-b p-4">
      <h1 class="text-2xl font-bold text-gray-900">Activity Logs</h1>
    </div>
    <div class="flex gap-4 p-4 rounded shadow bg-white m-4 w-32">
      <i class="fa-solid fa-filter mt-1"></i>
      <p class="font-semibold">Filter</p>
    </div>

    <div class="bg-gray-50 p-6 rounded">
      <v-table class="bg-white">
        <thead>
          <tr class="text-left text-sm text-gray-700 border-b">
            <th class="py-3 px-4">Date</th>
            <th class="py-3 px-4">User</th>
            <th class="py-3 px-4">Event</th>
            <th class="py-3 px-4">IP address</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(log, index) in logs"
            :key="index"
            class="border-b last:border-b-0 text-sm"
          >
            <td class="py-3 px-4">
              <div>{{ log.date }}</div>
              <div class="text-xs text-gray-500">{{ log.time }}</div>
            </td>
            <td class="py-3 px-4">{{ log.user }}</td>
            <td class="py-3 px-4" v-html="log.event"></td>
            <td class="py-3 px-4">{{ log.ip }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </MainLayout>
</template>
