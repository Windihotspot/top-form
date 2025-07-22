<template>
  <div class="bg-white p-4 shadow rounded-lg">
    <apexchart v-if="hasData" width="100%" type="donut" :options="chartOptions" :series="series"></apexchart>
    <div v-else class="text-center text-gray-500 py-8">No student data available</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import apexchart from 'vue3-apexcharts'

const props = defineProps({
  students: {
    type: Array,
    required: true
  }
})

const genderCounts = computed(() => {
  const counts = { Male: 0, Female: 0, Other: 0 }
  props.students.forEach((s) => {
    if (s.gender === 'Male') counts.Male++
    else if (s.gender === 'Female') counts.Female++
    else counts.Other++
  })
  return counts
})

const series = computed(() => [
  genderCounts.value.Male,
  genderCounts.value.Female,
  genderCounts.value.Other
])

const hasData = computed(() => series.value.some((count) => count > 0))

const chartOptions = computed(() => ({
  labels: [
    `Male ${genderCounts.value.Male}`,
    `Female ${genderCounts.value.Female}`,
    `Other ${genderCounts.value.Other}`
  ],
  colors: ['#40B5AD', '#F472B6', '#A3A3A3'],
  legend: { position: 'right' },
  stroke: { show: false },
  chart: { toolbar: { show: false } },
  plotOptions: { pie: { donut: { size: '65%' } } },
  dataLabels: {
    enabled: true,
   
  },

}))


</script>
