<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import MainLayout from '@/layouts/full/MainLayout.vue'
import VueApexCharts from 'vue3-apexcharts'

import { useDashboardStats } from '@/composables/useDashboardStats'
const userStore = useUserStore()

const stats = computed(() => userStore.dashboardStats ?? {})
console.log ("dashboard stats from store:", stats.value)

const {
  totalApplications,
  totalAccepted,
  totalDeclined,
  totalErrors,
  series,
  chartOptions,
  locationLabels,
  locationSeries,
  locationChartOptions,
  osLabels,
  osData,
  deviceSeries,
  deviceChartOptions,
  approvalChartSeries,
  approvalChartOptions,
  approvalRiskLabels,
  approvalRiskColors
} = useDashboardStats()

console.log("📊 Composable Dashboard Data:", {
  totals: {
    totalApplications: totalApplications.value,
    totalAccepted: totalAccepted.value,
    totalDeclined: totalDeclined.value,
    totalErrors: totalErrors.value
  },
  trendsChart: {
    series: series.value,
    chartOptions: chartOptions.value
  },
  locationChart: {
    labels: locationLabels.value,
    series: locationSeries.value,
    options: locationChartOptions.value
  },
  deviceChart: {
    osLabels: osLabels.value,
    osData: osData.value,
    series: deviceSeries.value,
    options: deviceChartOptions.value
  },
  approvalChart: {
    series: approvalChartSeries,
    options: approvalChartOptions,
    labels: approvalRiskLabels,
    colors: approvalRiskColors
  }
})
</script>

<template>
  <MainLayout>
    <!-- Analytics -->
    <div class="bg-white p-6 rounded shadow">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Analytics</h2>
      <p class="text-sm text-gray-500 mb-4">Key Metrics</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Total Applications -->
        <div class="bg-indigo-50 p-4 rounded shadow">
          <p class="text-sm text-gray-600">Total Applications</p>
          <p class="text-2xl font-semibold text-gray-800">{{ totalApplications }}</p>
        </div>

        <!-- Total Accepted -->
        <div class="bg-blue-50 p-4 rounded shadow">
          <p class="text-sm text-gray-600">Total Accepted</p>
          <p class="text-2xl font-semibold text-gray-800">{{ totalAccepted }}</p>
        </div>

        <!-- Total Declined -->
        <div class="bg-purple-50 p-4 rounded shadow">
          <p class="text-sm text-gray-600">Total Declined</p>
          <p class="text-2xl font-semibold text-gray-800">{{ totalDeclined }}</p>
        </div>

        <!-- Total Errors -->
        <div class="bg-blue-100 p-4 rounded shadow">
          <p class="text-sm text-gray-600">Total Errors</p>
          <p class="text-2xl font-semibold text-gray-800">{{ totalErrors }}</p>
        </div>
      </div>
    </div>

    <!-- Application Trends -->
    <div class="bg-white p-6 rounded shadow mt-4">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Application Trends</h2>
      <apexchart type="area" width="100%" height="320" :options="chartOptions" :series="series" />
    </div>

    <!-- Location & Device -->
    <div class="bg-white mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded shadow">
      <!-- Location -->
      <div class="bg-white p-4 rounded shadow">
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

      <!-- Device -->
      <div class="bg-white p-4 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-semibold text-gray-700">Traffic by Device</h2>
          <div class="text-sm text-gray-500">All ▼</div>
        </div>
        <apexchart type="bar" height="300" :options="deviceChartOptions" :series="deviceSeries" />
      </div>
    </div>

    <!-- Approval Rate -->
    <div class="bg-white p-6 rounded shadow mt-4">
      <h2 class="text-xl font-semibold text-gray-800 mb-1">Approval Rate</h2>
      <p class="text-sm text-gray-600 mb-4">Approval rate by customer risk level</p>

      <!-- Legend -->
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
