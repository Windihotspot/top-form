<template>
  <div class="bg-white p-4 rounded shadow-md">
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-sm font-semibold">Earnings</h2>
      <div class="text-xs text-gray-500">July, 2025</div>
    </div>

    <apexchart
      height="280"
      type="area"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import apexchart from 'vue3-apexcharts'

const props = defineProps({
  earnings: {
    type: Array,
    default: () => [],
  },
})

// Group earnings by day
const groupedData = computed(() => {
  const data = Array.from({ length: 31 }, (_, i) => ({
    day: String(i + 1).padStart(2, '0'),
    received: 0,
    pending: 0,
  }))

  for (const item of props.earnings) {
    const dayIndex = Number(item.day) - 1
    if (dayIndex >= 0 && dayIndex < 31) {
      data[dayIndex].received = item.received_amount || 0
      data[dayIndex].pending = item.pending_amount || 0
    }
  }

  return data
})

const filteredDays = ['02', '04', '06', '08', '10', '12', '14']

const series = computed(() => [
  {
    name: 'Received payments',
    data: groupedData.value
      .filter(d => filteredDays.includes(d.day))
      .map(d => d.received),
  },
  {
    name: 'Pending payments',
    data: groupedData.value
      .filter(d => filteredDays.includes(d.day))
      .map(d => d.pending),
  },
])
const chartOptions = {
      chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
         dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: 1,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.4,
      opacityFrom: 0.6,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  colors: ['green', 'red'], // Purple and Orange
  xaxis: {
   categories: ['02', '04', '06', '08', '10', '12', '14'],

   
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      formatter: val => `${Math.round(val / 1000)}k`,
      style: {
        fontSize: '10px',
      },
    },
  },
  grid: {
    strokeDashArray: 1,
    borderColor: '#e5e7eb', // light gray
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    markers: {
      radius: 12,
    },
  },
  tooltip: {
    y: {
      formatter: val => `${Math.round(val / 1000)}k`,
    },
  },
}

</script>
