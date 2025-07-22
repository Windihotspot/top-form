<template>
  <div class="bg-white p-4 shadow rounded-lg">
    <apexchart
      width="100%"
      type="donut"
      :options="chartOptions"
      :series="series"
    ></apexchart>
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

const chartOptions = {
  labels: ['Male', 'Female', 'Other'],
  colors: ['#3b82f6', '#ec4899', '#facc15'],
  legend: {
    position: 'bottom'
  },
  dataLabels: {
    enabled: true,
    formatter: function (val, opts) {
      return `${val.toFixed(1)}%`
    }
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return `${val} students`
      }
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '60%'
      }
    }
  }
}
</script>
