<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import api from '@/api'
import MainLayout from '@/layouts/full/MainLayout.vue'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github.css' // 👈 You can switch to other themes if desired
import { ElNotification } from 'element-plus'

hljs.registerLanguage('json', json)
import moment from 'moment'
const dateRange = ref([])

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
const statuses = ['all', 'accept', 'reject', 'pending']

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
    link.setAttribute('download', `exported-jobs-${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`)
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
    const jobDate = job.application_date // should be in 'YYYY-MM-DD' format

    const matchDate =
      !dateRange.value.length ||
      (moment(jobDate).isSameOrAfter(dateRange.value[0]) &&
        moment(jobDate).isSameOrBefore(dateRange.value[1]))

    // 1. Filter by status
    const matchStatus =
      !selectedStatus.value || selectedStatus.value === 'all'
        ? true
        : job.overall_decision?.toLowerCase() === selectedStatus.value

    // 2. Filter by search query
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

    return matchDate && matchStatus && matchSearch
  })
})

const dialog = ref(false)
const selectedJobId = ref(null)
const jobDetail = ref(null)
const jobLoading = ref(false)

const fetchJobDetail = async (applicationId) => {
  selectedJobId.value = applicationId
  jobLoading.value = true
  dialog.value = true
  try {
    const response = await api.get('/get-job', {
      params: {
        application_id: applicationId // ✅ Pass it as query param
      }
    })
    console.log('job detail response:', response)
    jobDetail.value = response.data
    console.log('job detail value:', jobDetail.value)
  } catch (error) {
    console.log('Failed to fetch job detail:', error)
    jobDetail.value = { error: 'Failed to load job detail' }
  } finally {
    jobLoading.value = false
    await nextTick() // Wait for DOM to update before applying highlight
    highlightJson()
  }
}

const highlightJson = () => {
  const blocks = document.querySelectorAll('pre code')
  blocks.forEach((block) => {
    hljs.highlightElement(block)
  })
}

watch(dialog, (val) => {
  if (!val) jobDetail.value = null // Clear on close
})

const formatJson = (data) => {
  return JSON.stringify(data, null, 2)
}

const copyToClipboard = async () => {
  const jsonText = formatJson(jobDetail?.data?.sofri_data ?? jobDetail)
  try {
    await navigator.clipboard.writeText(jsonText)
    ElNotification({
      title: 'Copied!',
      message: 'JSON response copied to clipboard.',
      type: 'success',
      duration: 3000
    })
  } catch (err) {
    console.error('Failed to copy', err)
    ElNotification({
      title: 'Error',
      message: 'Failed to copy to clipboard.',
      type: 'error'
    })
  }
}
</script>

<template>
  <MainLayout>
    <div class="p-4 rounded shadow bg-white m-4">
      <!-- Title -->
      <div class="mb-2">
        <h1 class="text-lg font-bold">Job List</h1>
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
            class="w-32 min-h-0 h-8 text-sm"
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

    <div class="p-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[200px]">
        <v-progress-circular indeterminate color="#1f5aa3" size="80" width="8" />
        <span class="mt-2 text-gray-600 text-sm">Loading jobs...</span>
      </div>

      <!-- Table -->
      <div v-else class="overflow-y-auto">
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
                    @click="fetchJobDetail(job.application_id)"
                    class="bg-[#1f5aa3] text-white px-4 py-1 rounded hover:bg-blue-600 cursor-pointer"
                  >
                    View
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <v-dialog v-model="dialog" max-width="800">
          <v-card>
            <v-card-title class="flex justify-between items-center text-lg font-semibold pa-4">
              <div class="flex items-center justify-end space-x-4">
                <!-- Copy Icon with Tooltip -->
                <v-tooltip text="Copy to clipboard" location="top">
                  <template #activator="{ props }">
                    <i
                      class="fas fa-copy cursor-pointer fa-lg"
                      v-bind="props"
                      @click="copyToClipboard"
                    ></i>
                  </template>
                </v-tooltip>

                <!-- Close Icon -->
                <i class="fas fa-times cursor-pointer fa-lg" @click="dialog = false"></i>
              </div>
            </v-card-title>

            <v-card-text>
              <div v-if="jobLoading" class="flex justify-center items-center min-h-[200px] gap-4">
                <v-progress-circular indeterminate color="#1f5aa3" size="40" width="3" />
                <span class="mt-2 text-gray-600 text-sm">Loading job details</span>
              </div>
              <div v-else class="bg-gray-100 p-4 rounded overflow-auto text-sm">
                <pre><code class="json">{{ formatJson(jobDetail?.data?.sofri_data ?? jobDetail) }}</code></pre>
              </div>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn color="primary" variant="plain" @click="dialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </div>
  </MainLayout>
</template>
