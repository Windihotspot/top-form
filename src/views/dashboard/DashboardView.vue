<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import MainLayout from '@/layouts/full/MainLayout.vue'
import VueApexCharts from 'vue3-apexcharts'
import AnimatedStats from '@/components/AnimatedStats.vue'

import { useDashboardStats } from '@/composables/useDashboardStats'
const userStore = useUserStore()
const stats = computed(() => userStore.dashboardStats ?? {})
console.log('dashboard stats from store:', stats.value)

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
  approvalRiskColors,
  percentageAccepted
} = useDashboardStats()

console.log('📊 Composable Dashboard Data:', {
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
  },
  percentageAccepted: percentageAccepted.value
})
</script>

<template>
  <MainLayout>
    <!-- Analytics -->
    <div class="bg-white p-6 rounded">
      <h2 class="text-xl font-bold mb-2">Analytics</h2>
      <p class="text-sm mb-4 font-normal">Key Metrics</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStats
          label="Total Applications"
          :value="totalApplications"
          colorClass="bg-indigo-50"
          :percentage="percentageAccepted"
        />
        <AnimatedStats
          label="Total Accepted"
          :percentage="percentageAccepted"
          :value="totalAccepted"
          colorClass="bg-blue-50"
        />
        <AnimatedStats
          label="Total Declined"
          :percentage="percentageAccepted"
          :value="totalDeclined"
          colorClass="bg-purple-50"
        />
        <AnimatedStats
          label="Total Errors"
          :percentage="percentageAccepted"
          :value="totalErrors"
          colorClass="bg-blue-100"
        />
      </div>
    </div>

    <!-- Application Trends -->
    <div class="bg-white p-6 rounded mt-4">
      <h2 class="text-sm font-semibold mb-4">Application Trends</h2>
      <apexchart type="area" width="100%" height="320" :options="chartOptions" :series="series" />
    </div>

    <!-- Location & Device -->
    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Location -->
      <div class="p-4 bg-white rounded">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-semibold ">Traffic by Location</h2>
          <!-- <v-select
            v-model="selectedLocation"
            :items="locationOptions"
            density="compact"
            variant="outlined"
            class="min-w-[60px] max-w-[100px] h-8 text-xs"
            hide-details
            style="padding: 0; font-size: 6px"
          /> -->
        </div>
        <apexchart
          type="donut"
          width="100%"
          :options="locationChartOptions"
          :series="locationSeries"
        />
      </div>

      <!-- Device -->
      <div class="bg-white p-4 rounded">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-semibold">Traffic by Device</h2>
        </div>
        <apexchart type="bar" height="300" :options="deviceChartOptions" :series="deviceSeries" />
      </div>
    </div>

    <!-- Approval Rate -->
    <div class="bg-white p-6 rounded mt-4">
      <h2 class="text-sm font-semibold mb-1">Approval Rate</h2>
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
