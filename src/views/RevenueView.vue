<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import AnimatedStats from '@/components/AnimatedStats.vue'
import Apexchart from 'vue3-apexcharts'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id

// ========== DATA REFS ==========
const kpis = ref({
  total_fees_assigned: 0,
  total_collected: 0,
  pending_fees: 0,
  overdue_fees: 0
})

const collectionsByMonth = ref([])
const feesByType = ref([])
const recentTransactions = ref([])

// ========== LOADING STATES ==========
const loading = ref(false)
const error = ref(null)

// ========== FUNCTIONS ==========
const getKPIs = async () => {
  const { data, error: err } = await supabase.rpc('get_payments_summary', {
    p_school_id: schoolId
  })

  if (err) {
    error.value = err.message
    return
  }
  if (data) {
    kpis.value = data
    console.log('payments kpis:', data)
  }
}

const getCollectionsByMonth = async () => {
  const { data, error: err } = await supabase.rpc('get_collections_by_month', {
    school_id: schoolId
  })
  if (err) {
    error.value = err.message
    return
  }
  collectionsByMonth.value = data || []
  console.log('collections by month:', data)
}

const getFeesByType = async () => {
  const { data, error: err } = await supabase.rpc('get_payment_methods_distribution', {
    school_id: schoolId
  })
  if (err) {
    error.value = err.message
    return
  }
  feesByType.value = data || []
  console.log('payment methods:', data)
}

const getRecentTransactions = async () => {
  const { data, error: err } = await supabase.rpc('get_recent_transactions', {
    school_id: schoolId
  })
  if (err) {
    error.value = err.message
    return
  }
  recentTransactions.value = data || []
  console.log('recent payments:', data)
}

// ========== CHART CONFIG ==========
const collectionsOptions = ref({
  chart: { type: 'line', toolbar: { show: false } },
   noData: {
    text: 'No data available',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      color: '#999',
      fontSize: '16px'
    }
  },
  stroke: { curve: 'smooth' },
  xaxis: { categories: [] },
  colors: ['#6366F1']
})
const collectionsSeries = ref([{ name: 'Collected', data: [] }])

const feesOptions = ref({
  chart: { type: 'donut' },
   noData: {
    text: 'No data available',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      color: '#999',
      fontSize: '16px'
    }
  },
  labels: [],
  legend: { position: 'bottom' },
  colors: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6']
})
const feesSeries = ref([])

// Chart data
const stackedBarData = ref([])
const chartOptions = ref({})
const chartSeries = ref([])

const getCurrentMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const startDate = start.toISOString().split('T')[0] // YYYY-MM-DD
  const endDate = end.toISOString().split('T')[0] // YYYY-MM-DD
  return { startDate, endDate }
}

// Fetch monthly overview
const getFeesOverviewByMonth = async () => {
  const { startDate, endDate } = getCurrentMonthRange()
  const { data, error } = await supabase.rpc('get_fees_overview_by_month', {
    p_school_id: schoolId,
    p_start_date: startDate,
    p_end_date: endDate
  })

  if (error) {
    console.error('Error fetching overview:', error.message)
    return
  }

  stackedBarData.value = data || []
  console.log('overview by month:', data)
  // Build chart series
  chartSeries.value = [
    {
      name: 'Collected',
      data: stackedBarData.value.map((item) => item.collected)
    },
    {
      name: 'Pending',
      data: stackedBarData.value.map((item) => item.pending)
    },
    {
      name: 'Overdue',
      data: stackedBarData.value.map((item) => item.overdue)
    }
  ]

  chartOptions.value = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: true }
    },
     noData: {
    text: 'No data available',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      color: '#999',
      fontSize: '16px'
    }
  },
    plotOptions: {
      bar: { horizontal: false }
    },
    xaxis: {
      categories: stackedBarData.value.map((item) => item.month),
      title: { text: 'Month' }
    },
    yaxis: {
      title: { text: 'Amount' }
    },
    legend: {
      position: 'top'
    },
    fill: { opacity: 1 },
    colors: ['#22c55e', '#f97316', '#ef4444'] // Collected = green, Pending = orange, Overdue = red
  }
}

// ========== PAGE LOAD ==========
onMounted(async () => {
  loading.value = true
  await Promise.all([
    getKPIs(),
    getCollectionsByMonth(),
    getFeesByType(),
    getRecentTransactions(),
    getFeesOverviewByMonth()
  ])
  loading.value = false
})
</script>

<template>
  <MainLayout>
    <div
      v-if="loading"
      class="fill-height d-flex justify-center align-center mx-auto items-center flex my-auto mx-auto"
    >
      <v-progress-circular indeterminate color="success" size="48" />
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        <!-- Total Fees Assigned -->
        <AnimatedStats
          iconClass="fas fa-file-invoice-dollar"
          iconBgClass="text-blue-500"
          title="Total Fees Assigned"
          :value="kpis.total_fees_assigned"
          :index="0"
        />

        <!-- Total Collected -->
        <AnimatedStats
          iconClass="fas fa-coins"
          iconBgClass="text-green-500"
          title="Total Collected"
          :value="kpis.total_collected"
          :index="1"
        />

        <!-- Pending Fees -->
        <AnimatedStats
          iconClass="fas fa-clock"
          iconBgClass="text-yellow-500"
          title="Pending Fees"
          :value="kpis.pending_fees"
          :index="2"
        />

        <!-- Overdue Fees -->
        <AnimatedStats
          iconClass="fas fa-exclamation-circle"
          iconBgClass="text-red-500"
          title="Overdue Fees"
          :value="kpis.overdue_fees"
          :index="3"
        />
      </div>

      <!-- Charts Section -->
      <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Collections Over Time -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Collections over time</h2>
          <apexchart
            type="line"
            height="300"
            :options="collectionsOptions"
            :series="collectionsSeries"
          />
        </div>

        <!-- Fees by Type -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Payment method distribution</h2>
          <apexchart type="donut" height="300" :options="feesOptions" :series="feesSeries" />
        </div>

        <div class="bg-white shadow-md rounded-lg p-4">
          <h2 class="text-lg font-semibold mb-4">Monthly Fees Overview</h2>
          <apexchart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
        </div>
      </div>
    </div>
  </MainLayout>
</template>
