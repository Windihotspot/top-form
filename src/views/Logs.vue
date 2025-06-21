<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, computed } from 'vue'

const logs = ref([
  {
    date: 'May 25, 2025',
    time: '3:06pm',
    user: 'John Doe',
    event: 'Logged in',
    ip: '123.456.789.667'
  },
  {
    date: 'May 25, 2025',
    time: '3:06pm',
    user: 'John Doe',
    event: 'Applied changed to <strong>Threshold</strong>',
    ip: '123.456.789.667'
  },
  {
    date: 'May 25, 2025',
    time: '3:06pm',
    user: 'John Doe',
    event: 'Deployed Changes',
    ip: '123.456.789.667'
  },
  {
    date: 'May 25, 2025',
    time: '3:06pm',
    user: 'John Doe',
    event: 'Logged out',
    ip: '123.456.789.667'
  },
  {
    date: 'May 25, 2025',
    time: '3:06pm',
    user: 'John Doe',
    event: 'Logged in',
    ip: '123.456.789.667'
  },
  {
    date: 'May 25, 2025',
    time: '3:06pm',
    user: 'John Doe',
    event: 'Changed password',
    ip: '123.456.789.667'
  }
])

const page = ref(1)
const rowsPerPage = ref(100)

const pageCount = computed(() =>
  Math.ceil(logs.value.length / rowsPerPage.value)
)

const pageOptions = computed(() =>
  Array.from({ length: pageCount.value }, (_, i) => i + 1)
)

const paginatedLogs = computed(() => {
  const start = (page.value - 1) * rowsPerPage.value
  return logs.value.slice(start, start + rowsPerPage.value)
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
          v-for="(log, index) in paginatedLogs"
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

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-4 text-sm text-gray-600">
      <div class="flex items-center space-x-2">
        <span>Results per page</span>
        <v-select
          v-model="rowsPerPage"
          :items="[25, 50, 100]"
          density="compact"
          hide-details
          class="w-20"
          variant="outlined"
        />
      </div>

      <div class="flex items-center space-x-2">
        <v-btn
          icon
          variant="text"
          :disabled="page === 1"
          @click="page = 1"
        >
          «
        </v-btn>
        <v-btn
          icon
          variant="text"
          :disabled="page === 1"
          @click="page--"
        >
          ‹
        </v-btn>
        <span>Page</span>
        <v-select
          v-model="page"
          :items="pageOptions"
          hide-details
          density="compact"
          class="w-20"
          variant="outlined"
        />
        <span>of {{ pageCount }}</span>
        <v-btn
          icon
          variant="text"
          :disabled="page === pageCount"
          @click="page++"
        >
          ›
        </v-btn>
        <v-btn
          icon
          variant="text"
          :disabled="page === pageCount"
          @click="page = pageCount"
        >
          »
        </v-btn>
      </div>
    </div>
  </div>


  </MainLayout>

</template>
