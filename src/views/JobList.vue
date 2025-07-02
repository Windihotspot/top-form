<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api'
import MainLayout from '@/layouts/full/MainLayout.vue'

import moment from 'moment'

const formatCurrency = (amount) => {
  if (isNaN(amount)) return amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount)
}
const loading = ref(false)
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

const exportCsv = async () => {
  loading.value = true

  try {
    const response = await api.get('/export-csv', {
      params: {
        per_page: 2,
        page: 1
      },
      responseType: 'blob' // Ensure we receive it as a Blob
    })

    // Create a URL for the Blob
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `exported-jobs-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()

    // Clean up
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.log('Failed to export csv:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchJobs)

// Filtered jobs for search and/or status filter

const filteredJobs = computed(() => {
  const query = searchQuery.value.toLowerCase()

  return jobs.value.filter((job) => {
    // 1. Filter by status
    const matchStatus = selectedStatus.value ? job.overall_decision === selectedStatus.value : true

    // 2. Filter by search query (across visible fields)
    const searchableFields = [
      'application_date',
      'application_id',
      'requested_amount',
      'internal_score',
      'credit_score',
      'age',
      'income',
      'employment_type',
      'industry',
      'risk_level',
      'education_level',
      'residence',
      'kyc_level',
      'marital_status',
      'state',
      'overall_decision'
    ]

    const matchSearch = searchableFields.some((field) => {
      const value = job[field]

      // Format dates and currency to match what user sees
      if (field === 'application_date') {
        return moment(value).format('LL').toLowerCase().includes(query)
      }

      if (['income', 'requested_amount'].includes(field)) {
        return formatCurrency(value).toLowerCase().includes(query)
      }

      return String(value ?? '')
        .toLowerCase()
        .includes(query)
    })

    return matchStatus && matchSearch
  })
})
</script>

<template>
  <MainLayout>
    <div class="p-4 rounded shadow bg-white m-4">
      <!-- Title -->
      <div class="mb-2 border-b">
        <h1 class="text-xl font-bold">Job List</h1>
      </div>

      <div class="flex items-center justify-between p-2">
        <!-- Filter (Vuetify Select) -->
        <div class="flex items-center space-x-2 pt-2">
          <i class="fa-solid fa-filter"></i>

          <v-select
            color="#1f5aa3"
            v-model="selectedStatus"
            :items="statuses"
            label="Filter"
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
        <div class="flex justify-end items-center mb-4">
          <button
            @click="exportCsv"
            class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
          >
            <i class="fas fa-download"></i>

            Export as CSV
          </button>
        </div>

        <div class="overflow-x-auto bg-white shadow rounded-lg">
          <table class="min-w-full text-sm text-center text-gray-700">
            <thead class="bg-gray-100 text-gray-900 font-semibold text-sm">
              <tr>
                <th class="px-4 py-3">S/N</th>
                <th class="px-4 py-3">Application Date/Time</th>
                <th class="px-4 py-3">Application ID</th>
                <th class="px-4 py-3">Requested Amount</th>
                <th class="px-4 py-3">Internal Score</th>
                <th class="px-4 py-3">Credit Score</th>
                <th class="px-4 py-3">Age</th>
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
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="py-3">{{ moment(job.application_date).format('LL') }}</td>
                <td class="px-4 py-3">{{ job.application_id }}</td>
                <td class="px-4 py-3">{{ formatCurrency(job.requested_amount) }}</td>
                <td class="px-4 py-3">{{ job.internal_score }}</td>
                <td class="px-4 py-3">{{ job.credit_score }}</td>
                <td class="px-4 py-3">{{ job.age }}</td>
                <td class="px-4 py-3">{{ formatCurrency(job.income) }}</td>
                <td class="py-3">{{ job.employment_type }}</td>
                <td class="px-4 py-3">{{ job.industry }}</td>
                <td class="px-4 py-3">{{ job.risk_level }}</td>
                <td class="px-4 py-3">{{ job.education_level }}</td>
                <td class="px-4 py-3">{{ job.residence }}</td>
                <td class="py-3">{{ job.kyc_level }}</td>
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
