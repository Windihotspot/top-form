<script setup>
import { ref, onMounted, computed, watch } from 'vue'
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
    labels.push(
      d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      })
    ) // e.g., "05 Jul"
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
const recentLogs = ref([])
const tabs = ['all', 'student', 'teacher', 'employee']
const activeTab = ref('all')
const loading = ref(false)

// Define a date range for trends
const today = new Date()
const startDate = new Date(today)
startDate.setDate(today.getDate() - 30) // 30 days ago

const toISO = (d) => d.toISOString().slice(0, 10)

const loadRecentAttendance = async (type = 'all', limit = 10) => {
  loading.value = true
  const { data, error } = await supabase.rpc('get_recent_attendance_logs', {
    p_school_id: schoolId,
    p_user_type: type,
    p_limit: limit
  })

  if (error) {
    console.error('Recent Attendance Error:', error)
    loading.value = false
    return
  }

  recentLogs.value = data
  loading.value = false
  console.log('recent attendance logs:', recentLogs.value)
}

// Automatically load attendance for selected tab
watch(activeTab, (val) => {
  loadRecentAttendance(val)
})

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

  // Assign values to refs
  if (!summaryError) dailySummary.value = summaryData
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

const isLoading = ref(true)

onMounted(async () => {
  await Promise.all([loadAttendanceTrends(), loadAttendanceData(), loadRecentAttendance()])
  isLoading.value = false
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
      <div class="bg-white flex rounded shadow justify-between items-center border-b p-4 mb-4">
        <div class="mb-2">
          <h1 class="text-xl font-bold mt-4">Attendance</h1>
          <p class="text-gray-500 text-sm mt-1">View and Manage your attendance records</p>
        </div>

        <v-btn
         
          size="medium"
          class="normal-case custom-btn hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-md shadow-md"
        >
          <span
            class="bg-white text-blue-600 rounded-full p-1 flex items-center justify-center w-4 h-4 mr-2"
          >
            <i class="fa-solid fa-plus text-sm text-[#15803d]"></i>
          </span>
          Add new record
        </v-btn>
      </div>
    <div
      v-if="isLoading"
      class="fill-height d-flex justify-center align-center mx-auto items-center flex my-auto mx-auto"
    >
      <v-progress-circular indeterminate color="success" size="48" />
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded shadow m-2 p-4">
          <h3 class="text-lg font-semibold mb-4">Recent Attendance</h3>

          <!-- Tabs -->
          <div class="flex space-x-4 mb-4 border-b pb-2">
            <button
              v-for="tab in tabs"
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'capitalize px-3 py-1 rounded-md text-sm',
                activeTab === tab
                  ? 'bg-green-100 text-green-600 font-semibold'
                  : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Attendance List -->
          <!-- Spinner and Attendance -->
          <div v-loading="loading" class="min-h-[120px] relative">
            <div v-if="recentLogs.length > 0">
              <div v-for="log in recentLogs" :key="log.id" class="flex items-center mb-4">
                <img
                  :src="log.avatar_url || '/default-avatar.png'"
                  alt="avatar"
                  class="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <p class="font-medium">{{ log.user_name }}</p>
                  <p class="text-xs text-gray-500">{{ log.user_role }}</p>
                  <p class="text-xs text-gray-400">
                    {{
                      new Date(log.check_in_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    }}
                  </p>
                </div>
              </div>
            </div>
            <p v-else-if="!loading" class="text-sm text-gray-400">No recent logs found.</p>
          </div>
        </div>

         <div class="bg-white p-4 rounded shadow m-2 ">
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

        <div class="bg-white p-4 rounded shadow-md m-2">
          <Apexchart
            height="250"
            type="line"
            :options="baseChartOptions('Student')"
            :series="generateSeries('student')"
          />
        </div>

        <!-- Teachers -->
        <div class="bg-white p-4 rounded shadow-md m-2">
          <Apexchart
            height="250"
            type="line"
            :options="baseChartOptions('Teacher Attendance')"
            :series="generateSeries('teacher')"
          />
        </div>

        <!-- Employees -->
        <div class="bg-white p-4 rounded shadow-md m-2">
          <Apexchart
            height="250"
            type="line"
            :options="baseChartOptions('Employee Attendance')"
            :series="generateSeries('employee')"
          />
        </div>

       

        <!-- Total -->
        <!-- <Apexchart
        height="250"
        type="line"
        :options="baseChartOptions('Overall Attendance')"
        :series="generateSeries('total')"
      /> -->
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
  .custom-btn {
  background-color: #15803d;
  text-transform: none;
}
.v-btn{
  text-transform: none;
}
</style>
