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
</script>

<template>
  <MainLayout>
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
