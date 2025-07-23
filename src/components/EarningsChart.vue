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

const filteredDays = ['01', '05', '10', '15', '20', '25', '30']

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
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 500,
      animateGradually: { enabled: true, delay: 150 },
      dynamicAnimation: { enabled: true, speed: 350 },
    },
  },
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
  colors: ['#7e22ce', '#f97316'], // Purple and Orange
  xaxis: {
   categories: ['01', '05', '10', '15', '20', '25', '30'],

    labels: {
      style: {
        fontSize: '10px',
      },
    },
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
