<template>
  <div class="bg-white p-4 rounded shadow-md">
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-sm font-semibold">Attendance Trend</h2>
      <div class="text-xs text-gray-500">July, 2025</div>
    </div>

    <Apexchart height="280" type="area" :options="chartOptions" :series="series" />
     <pre>{{ props.trends }}</pre>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Apexchart from 'vue3-apexcharts'

const props = defineProps({
  trends: {
    type: Array,
    default: () => []
  }
})

// Extract data for selected days
const filteredDays = ['01', '05', '10', '15', '20', '25', '30']

const groupedData = computed(() => {
  const map = {}
  props.trends.forEach((entry) => {
    const day = entry.date.split('-')[2] // get day part
    const total = entry.present_count + entry.absent_count + entry.late_count
    const percentage = total > 0 ? Math.round((entry.present_count / total) * 100) : 0
    map[day] = percentage
  })

  
  return filteredDays.map((day) => ({
    day,
    percentage: map[day] || 0
  }))
})
console.log('Grouped Data:', groupedData.value)

const series = computed(() => [
  {
    name: 'Attendance Rate',
    data: groupedData.value.map((d) => d.percentage)
  }
])

const chartOptions = {
  chart: {
    type: 'line',
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: 1
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.4,
      opacityFrom: 0.6,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  },
  colors: ['#3b82f6'], // Tailwind Blue-500
  xaxis: {
    categories: filteredDays,
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: {
      formatter: (val) => `${val}%`,
      style: {
        fontSize: '10px'
      }
    }
  },
  grid: {
    strokeDashArray: 1,
    borderColor: '#e5e7eb'
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    markers: {
      radius: 12
    }
  },
  tooltip: {
    y: {
      formatter: (val) => `${val}%`
    }
  }
}
</script>
