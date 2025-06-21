<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api'
import MainLayout from '@/layouts/full/MainLayout.vue'

const jobs = ref([])
const isLoading = ref(true)
const selectedStatus = ref(null)
const searchQuery = ref('')
const statuses = ['ACCEPT', 'REJECT', 'PENDING'] // Adjust as needed

const fetchJobs = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/get-jobs', {
      params: {
        per_page: 10
      }
    })

    if (response.data.status === 'success') {
      jobs.value = response.data.data.jobs
      console.log('job list:', jobs.value)
    }
  } catch (error) {
    console.error('Error fetching jobs:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchJobs)

// Filtered jobs for search and/or status filter
const filteredJobs = computed(() => {
  return jobs.value.filter((job) => {
    const matchStatus = selectedStatus.value ? job.overall_decision === selectedStatus.value : true
    const matchSearch = Object.values(job).some((val) =>
      String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    return matchStatus && matchSearch
  })
})
</script>

<template>
  <MainLayout>
    <div class="p-4 rounded shadow bg-white m-4">
      <!-- Title -->
      <div class="mb-2 border-b">
        <h1 class="text-2xl font-bold text-gray-900">Job List</h1>
      </div>

      <div class="flex items-center justify-between p-2">
        <!-- Filter (Vuetify Select) -->
        <div class="flex items-center space-x-2 pt-2">
          <i class="fa-solid fa-filter"></i>

          <v-select
            color="#1f5aa3"
            v-model="selectedStatus"
            :items="statuses"
            label="Status"
            density="compact"
            hide-details
            variant="outlined"
            class="w-32"
          ></v-select>
        </div>

        <!-- Search -->
        <v-text-field
          rounded
          v-model="searchQuery"
          placeholder="Search for a job"
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
    </div>

    <div class="p-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[200px]">
        <v-progress-circular indeterminate color="#1f5aa3" size="80" width="8" />
        <span class="mt-2 text-gray-600 text-sm">Loading jobs...</span>
      </div>

      <!-- Table -->
      <div v-else>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Income Table</h2>
          <button
            class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
          >
            <i class="mdi mdi-download"></i>
            Export as CSV
          </button>
        </div>

        <div class="overflow-x-auto bg-white shadow rounded-lg">
          <table class="min-w-full text-sm text-left text-gray-700">
            <thead class="bg-gray-100 text-gray-900 font-semibold">
              <tr>
                <th class="px-4 py-3">Income</th>
                <th class="px-4 py-3">Employment Type</th>
                <th class="px-4 py-3">Industry</th>
                <th class="px-4 py-3">Risk Level</th>
                <th class="px-4 py-3">Education</th>
                <th class="px-4 py-3">Residence</th>
                <th class="px-4 py-3">KYC Level</th>
                <th class="px-4 py-3">Marital Status</th>
                <th class="px-4 py-3">State</th>
                <th class="px-4 py-3">Overall Decision</th>
                <th class="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(job, index) in filteredJobs" :key="index" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  ₦{{ Number(job.income).toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
                </td>
                <td class="px-4 py-3">{{ job.employment_type }}</td>
                <td class="px-4 py-3">{{ job.industry }}</td>
                <td class="px-4 py-3">{{ job.risk_level }}</td>
                <td class="px-4 py-3">{{ job.education_level }}</td>
                <td class="px-4 py-3">{{ job.residence }}</td>
                <td class="px-4 py-3">{{ job.kyc_level }}</td>
                <td class="px-4 py-3">{{ job.marital_status }}</td>
                <td class="px-4 py-3">{{ job.state }}</td>
                <td class="px-4 py-3">
                  <span
                    :class="
                      job.overall_decision === 'ACCEPT'
                        ? 'text-green-600 py-1 px-2 text-xs font-semibold rounded-full bg-green-100'
                        : 'text-red-600 py-1 px-2 text-xs font-semibold rounded-full bg-red-100'
                    "
                  >
                    {{ job.overall_decision }}
                  </span>
                </td>
                <td class="py-3 px-6 text-center">
                  <span
                    class="bg-[#1f5aa3] text-white px-4 py-1 rounded hover:bg-blue-600 cursor-pointer"
                  >
                    View
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
