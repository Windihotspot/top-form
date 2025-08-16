<script setup>
import { ref, onMounted, computed } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import api from '@/services/api'
import AnimatedStats from '@/components/AnimatedStats.vue'
import StudentsGenderChart from '@/components/StudentsGenderChart.vue'
import AttendanceChart from '@/components/AttendanceChart.vue'
import EarningsChart from '@/components/EarningsChart.vue'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const notifications = ref([])

const loading = ref(true)

const studentsHeaders = [
  { title: 'Name', key: 'full_name' },
  { title: 'Class', key: 'class' },
  { title: 'Marks %', key: 'marks_percent' },
  { title: 'Rank', key: 'rank' }
]

const data = ref({
  students: [],
  teachers: [],
  employees: [],
  revenue: [],
  expenses: [],
  attendance: [],
  earnings: [],
  notifications: []
})

const fetchData = async (endpoint, key) => {
  try {
    const response = await api.get(`/${endpoint}`)
    if (key) data.value[key] = response.data.data
    console.log(`${key || endpoint}`, response)
    return response.data.data
  } catch (err) {
    console.error(`Error fetching ${key || endpoint}:`, err)
    return [] // Ensure it always returns an array
  }
}

const fetchAttendanceSummary = async () => {
  const now = new Date()
  const month = now.getMonth() + 1 // JS months are 0-based
  const year = now.getFullYear()

  try {
    const response = await api.get(`/attendance/summary?month=${month}&year=${year}`)
    data.value.attendance = response.data.data
    console.log('Attendance summary:', response.data.data)
  } catch (err) {
    console.error('Error fetching attendance summary:', err)
  }
}

const fetchStoredNotifications = async () => {
  const adminId = authStore.admin?.id
  const adminRole = authStore.admin?.role
  const schoolId = authStore.admin?.school_id

  if (!adminId || !adminRole || !schoolId) {
    console.log('Missing required admin data to fetch notifications')
    notifications.value = []
    return
  }

  const { data, error } = await supabase.rpc('manage_notifications', {
    p_action: 'fetch',
    p_admin_id: adminId,
    p_school_id: schoolId,
    p_role: adminRole,
    p_limit: 4,
    p_offset: 0
  })

  if (error) {
    console.log('Error fetching notifications:', error)
    notifications.value = []
    return
  }

  notifications.value = data || []
  console.log('stored notifications:', notifications.value)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const importanceColor = (level) => {
  switch (level) {
    case 'High':
      return 'red'
    case 'Medium':
      return 'orange'
    case 'Low':
      return 'green'
    default:
      return 'blue'
  }
}

const markAsRead = (id) => {
  console.log('Mark as read:', id)
}

const archive = (id) => {
  console.log('Archive:', id)
}

const deleteItem = (id) => {
  console.log('Delete:', id)
}
const fetchNotifications = async () => {
  try {
    const response = await api.get('/notifications')
    data.value.notifications = response.data.data
    console.log('Notifications:', response.data.data)
  } catch (err) {
    console.log('Error fetching notifications:', err)
  }
}
const fetchEarningsSummary = async () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  try {
    const response = await api.get(`/earnings/summary?month=${month}&year=${year}`)
    data.value.earnings = response.data.data
    console.log('Earnings summary:', response.data.data)
  } catch (err) {
    console.error('Error fetching earnings summary:', err)
  }
}

// const fetchStudentsWithClasses = async () => {
//   const { data: students, error } = await supabase
//     .from('students')
//     .select(`*, class:classes(name)`)
//     .order('marks_percent', { ascending: false })
//   console.log('students with classes:', students)
//   if (error) {
//     console.log('Supabase error:', error)
//     return
//   }

//   data.value.students = students.map((s) => ({
//     ...s,
//     class_name: s.class?.name || 'N/A',
//     marks_percent: s.marks_percent || Math.floor(Math.random() * 100),
//     rank: s.rank
//   }))
// }
const classMap = {
  '54c2929a-de11-4829-87ab-5ccd2fdf8998': 'JSS1',
  '2ab9da37-18d7-4b21-b089-c907c9fee25b': 'JSS2',
  '7b614ee8-5f72-427b-bd78-eeef84d2347a': 'JSS3',
  'e2679e5e-5fe9-44c1-bf2b-4b6aa0f82425': 'SSS1',
  '608b08db-906d-4f11-86dc-09c6a0d13ff5': 'SSS2',
  'b316c14c-8877-42b5-b0c6-c4370cc6e3a3': 'SSS3'
}
const mapClassIdToName = (classId) => {
  return classMap[classId] || 'Unknown'
}

const loadStudents = async () => {
  const students = await fetchData('students') // don't pass a key here

  const mappedStudents = students.map((s) => ({
    ...s,
    class_name: mapClassIdToName(s.class_id),
    marks_percent: s.marks_percent || Math.floor(Math.random() * 100),
    rank: s.rank || '-'
  }))

  // Sort by marks_percent in descending order
  mappedStudents.sort((a, b) => b.marks_percent - a.marks_percent)

  data.value.students = mappedStudents
}

const fetchAll = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchData('teachers', 'teachers'),
      loadStudents(),
      fetchData('employees', 'employees'),
      fetchData('revenue', 'revenue'),
      fetchData('expenses', 'expenses'),
      fetchAttendanceSummary(),
      fetchEarningsSummary(),
      fetchNotifications(),
      fetchStoredNotifications()
    ])
  } catch (err) {
    console.error('❌ Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

const totalStudents = computed(() => data.value.students.length)
const totalTeachers = computed(() => data.value.teachers.length)
const totalEmployees = computed(() => data.value.employees.length)
const totalRevenue = computed(() => {
  const total = data.value.revenue.reduce((sum, rev) => sum + (rev.amount || 0), 0)
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(total)
})

onMounted(fetchAll)
</script>

<template>
  <MainLayout>
    <div
      v-if="loading"
      class="fill-height d-flex justify-center align-center mx-auto items-center flex my-auto mx-auto"
    >
      <v-progress-circular indeterminate color="success" size="48" />
    </div>

    <div v-else>
      <!-- Statistics for students teachers employees revenue -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        <AnimatedStats
          iconClass="fas fa-users"
          iconBgClass="text-indigo-500"
          title="Total Students"
          :value="totalStudents"
          :index="0"
        />
        <AnimatedStats
          iconClass="fas fa-chalkboard-teacher"
          iconBgClass=" text-teal-500"
          title="Number of Teachers"
          :value="totalTeachers"
          :index="1"
        />
        <AnimatedStats
          iconClass="fas fa-user-friends"
          iconBgClass=" text-orange-500"
          title="Number of Employees"
          :value="totalEmployees"
          :index="2"
        />
        <AnimatedStats
          iconClass="fas fa-naira-sign"
          iconBgClass=" text-green-500"
          title="Total Revenue"
          :value="totalRevenue"
          :index="3"
        />
      </div>
      <!-- students by gender & top performing students -->
      <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Students by Gender (1 column) -->
        <div class="bg-white p-4 md:col-span-1">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-sm font-semibold">Students by Gender</h2>
          </div>
          <div class="mx-auto">
            <StudentsGenderChart :students="data.students" />
          </div>
        </div>

        <!-- Students List -->
        <div class="bg-white p-4 rounded md:col-span-2">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-sm font-semibold">Top performing students</h2>
          </div>
          <div v-if="data.students.length > 0" class="overflow-hidden">
            <v-data-table
              :headers="studentsHeaders"
              :items="data.students"
              class="elevation-1"
              fixed-header
              hide-default-footer
              height="200px"
            >
              <!-- Avatar + Name -->
              <template #item.full_name="{ item }">
                <div class="flex items-center gap-2">
                  <v-avatar size="32">
                    <v-img :src="item.avatar_url" alt="Avatar" />
                  </v-avatar>
                  <span>{{ item.full_name }}</span>
                </div>
              </template>

              <!-- Class name -->
              <template #item.class="{ item }">
                <span>{{ item.class_name }}</span>
              </template>

              <!-- Marks Percentage Chip -->
              <template #item.marks_percent="{ item }">
                <v-chip
                  :color="
                    item.marks_percent >= 75 ? 'green' : item.marks_percent >= 50 ? 'orange' : 'red'
                  "
                  dark
                  size="small"
                >
                  {{ item.marks_percent }}%
                </v-chip>
              </template>
            </v-data-table>
          </div>

          <div v-else class="text-center text-gray-500 py-4">No Students found.</div>
          <!-- 
           <div v-if="data.teachers.length > 0" class="overflow-hidden">
            <v-data-table
              :headers="headers"
              :items="data.teachers"
              :items-per-page="5"
              class="elevation-1"
              fixed-header
              height="300px"
            >
              <template #item.full_name="{ item: teacher }">
                <div class="flex items-center gap-2">
                  <v-avatar size="32">
                    <v-img :src="teacher.avatar_url" alt="Avatar" />
                  </v-avatar>
                  <span>{{ teacher.full_name }}</span>
                </div>
              </template>

              <template #item.actions="{ item: teacher }">
                <v-menu transition="scale-transition" location="top end">
                  <template #activator="{ props }">
                    <v-btn icon variant="text" v-bind="props">
                      <i class="fas fa-ellipsis-v text-gray-600"></i>
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item @click="viewTeacher(teacher)">
                      <v-list-item-title>View</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editTeacher(teacher)">
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteTeacher(teacher)">
                      <v-list-item-title class="text-red-500">Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </div> -->
        </div>
      </div>

      <!-- Earning and attendance percentaage-->
      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <EarningsChart :earnings="data.earnings" />
        </div>

        <div>
          <v-card class="w-full p-4 mb-4 shadow-md rounded">
             <h2 class="m-4 text-sm font-semibold">Notice Board</h2>
            <div
              v-for="item in notifications"
              :key="item.id"
              class="flex items-center p-4 justify-between"
            >
              <!-- Left: Avatar + Title + Chip -->
              <div class="flex items-center space-x-4">
                <!-- Avatar -->
                <v-avatar size="40">
                  <v-img
                    src="https://images.unsplash.com/photo-1622659097972-68f1d8c1829f?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Notification Image"
                  />
                </v-avatar>

                <!-- Title + Date -->
                <div class="w-60">
                  <!-- fixed width -->
                  <div class=" text-gray-800">
                    {{ item.title }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatDate(item.created_at) }}
                  </div>
                </div>

                <!-- Importance Chip -->
                <v-chip
                  :color="importanceColor(item.importance)"
                  size="small"
                  label
                  class="ml-2 flex-shrink-0 w-20 mx-auto my-auto justify-center"
                >
                  {{ item.importance }}
                </v-chip>
              </div>

              <!-- Right: Ellipsis menu -->
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    variant="text"
                    v-bind="props"
                    icon
                    size="small"
                    plain
                    class="text-gray-500 hover:text-gray-700"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="markAsRead(item.id)">
                    <v-list-item-title>Mark as Read</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="archive(item.id)">
                    <v-list-item-title>Archive</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteItem(item.id)">
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
