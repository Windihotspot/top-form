<script setup>
import { ref, onMounted, computed } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { supabase } from '@/supabase.js'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id
import Apexchart from 'vue3-apexcharts'


const dayLabels = ref([])

const generateDayLabels = () => {
  const labels = []
  const today = new Date()
  const startDate = new Date()
  startDate.setDate(today.getDate() - 29) // inclusive

  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    labels.push(d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    })) // e.g., "05 Jul"
  }

  dayLabels.value = labels
}
generateDayLabels()

// Refs to hold fetched data
const trends = ref({
  student: [],
  teacher: [],
  employee: [],
  total: []
})

const dailySummary = ref([])
const individualLogs = ref([])
const breakdown = ref([])

// Define a date range for trends
const today = new Date()
const startDate = new Date(today)
startDate.setDate(today.getDate() - 30) // 30 days ago

const toISO = (d) => d.toISOString().slice(0, 10)


const loadAttendanceTrends = async () => {
  const { data, error } = await supabase.rpc('get_attendance_trends', {
    school_id: schoolId,
    start_date: toISO(startDate),
    end_date: toISO(today)
  })

  console.log('attendance trends:', data)
  if (error) {
    console.error('Trend Error:', error)
    return
  }

  const grouped = {
    student: {},
    teacher: {},
    employee: {},
    total: {}
  }

  const dateLabels = new Set()

  data.forEach((entry) => {
    const dateObj = new Date(entry.date)
    const day = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    }) // e.g., '05 Jul'

    dateLabels.add(day)

    const totalCount = entry.present_count + entry.absent_count + entry.late_count
    const percentage = totalCount > 0 ? Math.round((entry.present_count / totalCount) * 100) : 0

    const type = entry.user_type || 'total'
    if (grouped[type]) {
      grouped[type][day] = percentage
    }
  })

  // Normalize missing days to 0
  const labels = Array.from(dateLabels).sort((a, b) => {
    const aDate = new Date(`2025 ${a}`)
    const bDate = new Date(`2025 ${b}`)
    return aDate - bDate
  })

  labels.forEach((day) => {
    Object.keys(grouped).forEach((type) => {
      grouped[type][day] = grouped[type][day] ?? 0
    })
  })

  trends.value = {
    student: labels.map((day) => grouped.student[day]),
    teacher: labels.map((day) => grouped.teacher[day]),
    employee: labels.map((day) => grouped.employee[day]),
    total: labels.map((day) => grouped.total[day])
  }

  dayLabels.value = labels // <-- Set this if you're binding to chart labels
}


const loadAttendanceData = async () => {
  // Daily summary
  const { data: summaryData, error: summaryError } = await supabase.rpc('get_daily_summary', {
    school_id: schoolId,
    summary_date: new Date('2025-07-15')
  })
  console.log('Daily attendance Summary:', summaryData, summaryError)

  // Individual logs
  const { data: logsData, error: logsError } = await supabase.rpc(
    'get_attendance_by_day_detailed',
    {
      input_school_id: schoolId,
      input_month: new Date().getMonth() + 1, // JS months are 0-indexed
      input_year: new Date().getFullYear()
    }
  )
  console.log('Individual Logs:', logsData, logsError)

  // Breakdown by type
  const { data: breakdownData, error: breakdownError } = await supabase.rpc(
    'get_attendance_breakdown_by_type',
    { school_id: schoolId, summary_date: new Date(today.getFullYear(), today.getMonth(), 1) }
  )
  console.log('Breakdown:', breakdownData, breakdownError)

  // Assign values to refs
  if (!summaryError) dailySummary.value = summaryData
  if (!logsError) individualLogs.value = logsData
  if (!breakdownError) breakdown.value = breakdownData
}

const generateSeries = (type) => [
  {
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Attendance`,
    data: trends.value[type]
  }
]

const baseChartOptions = (title) => ({
  chart: {
    type: 'line',
    toolbar: { show: false }
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: 2
  },

  colors: ['green'],
  xaxis: {
    categories: dayLabels.value,
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: {
      formatter: (val) => `${val}%`
    }
  },
  title: {
    text: title,
    align: 'left',
    style: {
      fontSize: '14px',
      fontWeight: 'bold'
    }
  },
  grid: {
    strokeDashArray: 1,
    borderColor: '#e5e7eb'
  },
  tooltip: {
    y: {
      formatter: (val) => `${val}%`
    }
  }
})

onMounted(() => {
  // Fetch trends
  loadAttendanceTrends()
  loadAttendanceData()
})

const formattedDate = today.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
})

const summaryDisplay = computed(() =>
  dailySummary.value
    .filter((item) => ['student', 'teacher', 'employee'].includes(item.user_type))
    .map((item) => {
      const { present_count, total_users, user_type } = item
      const percentage = total_users > 0 ? (present_count / total_users) * 100 : 0

      const map = {
        student: {
          label: 'Students',
          color: 'green',
          rawColor: '#10B981',
          icon: 'mdi mdi-school-outline',
          textColor: 'text-green-600'
        },
        teacher: {
          label: 'Teachers',
          color: 'yellow',
          rawColor: '#F59E0B',
          icon: 'mdi mdi-account-tie',
          textColor: 'text-yellow-700'
        },
        employee: {
          label: 'Staffs',
          color: 'indigo',
          rawColor: '#6366F1',
          icon: 'mdi mdi-briefcase-outline',
          textColor: 'text-indigo-600'
        }
      }

      return {
        ...item,
        percentage,
        present: present_count,
        total: total_users,
        ...map[user_type]
      }
    })
)
</script>

<template>
  <MainLayout>
    <div class="m-4 font-bold text-xl">Attendance</div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Students -->
      <div class="bg-white p-4 rounded shadow-md m-4">
        <Apexchart
          height="250"
          type="line"
          :options="baseChartOptions('Student')"
          :series="generateSeries('student')"
        />
      </div>

      <!-- Teachers -->
      <div class="bg-white p-4 rounded shadow-md m-4">
        <Apexchart
          height="250"
          type="line"
          :options="baseChartOptions('Teacher Attendance')"
          :series="generateSeries('teacher')"
        />
      </div>

      <!-- Employees -->
      <div class="bg-white p-4 rounded shadow-md m-4">
        <Apexchart
          height="250"
          type="line"
          :options="baseChartOptions('Employee Attendance')"
          :series="generateSeries('employee')"
        />
      </div>

      <div class="bg-white p-4 rounded-xl shadow-md">
        <h3 class="text-sm text-gray-500 mb-1">Today's Attendance</h3>
        <p class="text-xs text-gray-400 mb-4">{{ formattedDate }}</p>

        <div class="space-y-4">
          <div
  v-for="item in summaryDisplay"
  :key="item.user_type"
  class="flex items-center gap-4"
>
  <v-progress-circular
    :rotate="360"
    :size="60"
    :width="6"
    :model-value="item.percentage"
    :color="item.color"
    class="flex-shrink-0"
  >
    <!-- Centered percentage inside -->
    <span
      :style="{
        color: item.rawColor,
        fontSize: '14px',
        fontWeight: '500'
      }"
    >
      {{ Math.round(item.percentage) }}%
    </span>
  </v-progress-circular>

  <div>
    <p class="text-sm text-gray-600 capitalize flex items-center gap-1">
      <i :class="item.icon" :style="{ color: item.rawColor }"></i>
      {{ item.label }}
    </p>
    <p :class="['font-semibold text-sm', item.textColor]">
      {{ item.present }}/{{ item.total }}
    </p>
  </div>
</div>

        </div>
      </div>

      <!-- Total -->
      <!-- <Apexchart
        height="250"
        type="line"
        :options="baseChartOptions('Overall Attendance')"
        :series="generateSeries('total')"
      /> -->
    </div>
  </MainLayout>
</template>

<style scoped></style>
