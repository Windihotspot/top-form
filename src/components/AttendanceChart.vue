<!-- src/components/AttendanceChart.vue -->
<template>
  <div class="bg-white p-4 rounded shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-sm font-semibold">Attendance Percentage</h2>
     
    </div>
    <apexchart type="bar" height="280" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup>
    import { ref, computed } from 'vue'
import apexchart from 'vue3-apexcharts'

const props = defineProps({
  attendance: {
    type: Array,
    default: () => []
  }
})

const selectedWeek = ref('This week')

const series = computed(() => {
  const present = []
  const absent = []

  for (const item of props.attendance) {
    const total = item.present_count + item.absent_count + item.on_leave_count + item.half_day_count
    present.push(total ? Math.round((item.present_count / total) * 100) : 0)
    absent.push(total ? Math.round((item.absent_count / total) * 100) : 0)
  }

  return [
    { name: 'Present', data: present },
    { name: 'Absent', data: absent }
  ]
})

const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      columnWidth: '40%',
      borderRadius: 4
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: props.attendance.map(a => String(a.day).padStart(2, '0'))
  },
  yaxis: {
    max: 100,
    labels: {
      formatter: val => `${val}%`
    }
  },
  colors: ['#22c55e', '#ef4444'], // Green for present, red for absent
  tooltip: {
    y: {
      formatter: val => `${val}%`
    }
  },
  legend: { position: 'top' }
}))

</script>
