<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const selectedFilter = ref('All')
const filters = ['All', 'Web', 'Mobile']

const series = [
  {
    name: 'Accept',
    data: [12000, 8000, 11000, 22000, 27000, 20000, 22000]
  },
  {
    name: 'Reject',
    data: [7000, 13000, 17000, 10000, 15000, 24000, 28000]
  }
]

const chartOptions = {
  chart: {
    type: 'line',
    toolbar: { show: false }
  },
  stroke: {
    curve: 'smooth',
    width: [3, 3],
    dashArray: [0, 5] // Accept solid, Reject dashed
  },
  colors: ['#22c55e', '#ef4444'], // green for Accept, red for Reject
  legend: {
    position: 'top',
    horizontalAlign: 'right'
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.2,
      opacityTo: 0,
      stops: [0, 90, 100]
    }
  },
  markers: { size: 4 }
}

const locationSeries = [52.1, 22.8, 13.9, 11.2]
const locationChartOptions = {
  labels: ['Lagos', 'Ogun', 'Abuja', 'Other'],
  colors: ['#1E1E1E', '#8BB5FF', '#A8E6CF', '#CBD5E1'],
  dataLabels: {
    enabled: false
  },
  legend: {
    position: 'right',
    formatter: (val, opts) => `${val} - ${locationSeries[opts.seriesIndex]}%`
  },
  stroke: {
    show: false
  },
  chart: {
    toolbar: { show: false }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%'
      }
    }
  }
}

const deviceSeries = [
  {
    name: 'Traffic',
    data: [17000, 28000, 22000, 32000, 12000, 24000]
  }
]
const deviceChartOptions = {
  chart: {
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '40%'
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: ['Linux', 'Mac', 'iOS', 'Windows', 'Android', 'Other'],
    labels: {
      style: { colors: '#6B7280' }
    }
  },
  yaxis: {
    labels: {
      formatter: (val) => `${(val / 1000).toFixed(0)}K`,
      style: { colors: '#6B7280' }
    }
  },
  colors: ['#A78BFA', '#99F6E4', '#000000', '#93C5FD', '#BFDBFE', '#86EFAC'],
  grid: {
    strokeDashArray: 4
  }
}

const approvalRiskLabels = ['very low', 'low', 'medium', 'high', 'very high']
const approvalRiskColors = ['#1D7F3C', '#3B82F6', '#D9E86C', '#FCA5A5', '#DC2626']

const approvalChartSeries = [
  { name: 'very low', data: [40, 38, 41, 42, 39, 40] },
  { name: 'low', data: [10, 0, 9, 9, 0, 8] },
  { name: 'medium', data: [20, 19, 20, 20, 18, 19] },
  { name: 'high', data: [10, 0, 10, 10, 0, 9] },
  { name: 'very high', data: [10, 0, 10, 10, 0, 9] }
]

const approvalChartOptions = {
  chart: {
    stacked: true,
    toolbar: { show: false }
  },
  colors: approvalRiskColors,
  xaxis: {
    categories: [
      'May 1, 2025',
      'May 1, 2025',
      'May 1, 2025',
      'May 1, 2025',
      'May 1, 2025',
      'May 1, 2025'
    ],
    labels: { style: { colors: '#4B5563' } }
  },
  yaxis: {
    labels: {
      style: { colors: '#4B5563' }
    }
  },
  legend: {
    show: false
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '40%'
    }
  },
  grid: {
    strokeDashArray: 4
  },
  dataLabels: {
    enabled: false
  }
}
</script>

<template>
  <MainLayout>
    <!-- Analytics -->
    <div class="bg-white p-6 rounded shadow">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Analytics</h2>
      <p class="text-sm text-gray-500 mb-4">Key Metrics</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Card: Total Applications -->
        <div class="bg-indigo-50 p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600">Total Applications</p>
          <p class="text-2xl font-semibold text-gray-800">7,265</p>
          <div class="flex items-center text-sm text-green-600 mt-1">
            <span>+11.01%</span>
            <svg
              class="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>

        <!-- Card: Total Accepted -->
        <div class="bg-blue-50 p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600">Total Accepted</p>
          <p class="text-2xl font-semibold text-gray-800">3,671</p>
          <div class="flex items-center text-sm text-gray-500 mt-1">
            <span>-0.03%</span>
            <svg
              class="w-4 h-4 ml-1 transform rotate-90"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>

        <!-- Card: Total Declined -->
        <div class="bg-purple-50 p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600">Total Declined</p>
          <p class="text-2xl font-semibold text-gray-800">156</p>
          <div class="flex items-center text-sm text-green-600 mt-1">
            <span>+15.03%</span>
            <svg
              class="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>

        <!-- Card: Total Errors -->
        <div class="bg-blue-100 p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600">Total Errors</p>
          <p class="text-2xl font-semibold text-gray-800">2,318</p>
          <div class="flex items-center text-sm text-green-600 mt-1">
            <span>+6.08%</span>
            <svg
              class="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Application trends -->
    <div class="bg-white p-6 rounded mt-4 shadow">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Application Trends</h2>

      <div class="flex items-center justify-between mb-4">
        <!-- <v-select
          v-model="selectedFilter"
          :items="filters"
          variant="outlined"
          density="compact"
          class="w-32"
        ></v-select>

        <v-btn icon class="text-gray-500">
          <v-icon>mdi-dots-horizontal</v-icon>
        </v-btn> -->
      </div>

      <apexchart
        width="100%"
        type="line"
        :options="chartOptions"
        :series="series"
        height="320"
      ></apexchart>
    </div>

    <!-- location and device -->

    <div class="bg-white mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded shadow">
      <!-- Traffic by Location -->
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-semibold text-gray-700">Traffic by Location</h2>
          <div class="text-sm text-gray-500">All ▼</div>
        </div>
        <apexchart
          type="donut"
          width="100%"
          :options="locationChartOptions"
          :series="locationSeries"
        />
      </div>

      <!-- Traffic by Device -->
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-semibold text-gray-700">Traffic by Device</h2>
          <div class="text-sm text-gray-500">All ▼</div>
        </div>
        <apexchart type="bar" height="300" :options="deviceChartOptions" :series="deviceSeries" />
      </div>
    </div>

    <!-- Risk -->
    <div class="bg-white p-6 rounded shadow">
      <h2 class="text-xl font-semibold text-gray-800 mb-1">Approval Rate</h2>
      <p class="text-sm text-gray-600 mb-4">Approval rate by risk customer risk level</p>

      <!-- Custom legend -->
      <div class="flex flex-wrap gap-3 mb-4">
        <div
          v-for="(label, index) in approvalRiskLabels"
          :key="label"
          class="flex items-center gap-2 bg-gray-100 text-sm px-2 py-1 rounded-full"
        >
          <span
            :style="{ backgroundColor: approvalRiskColors[index] }"
            class="w-3 h-3 rounded-full block"
          ></span>
          {{ label }}
        </div>
      </div>

      <!-- Chart -->
      <apexchart
        type="bar"
        height="300"
        :options="approvalChartOptions"
        :series="approvalChartSeries"
      />
    </div>
  </MainLayout>
</template>

<style scoped>
.h-8 {
  height: 2rem;
}
.custom-btn {
  background-color: #1f5aa3;
  text-transform: none;
  text-transform: none;
}
v-btn {
  text-transform: none;
}
</style>
