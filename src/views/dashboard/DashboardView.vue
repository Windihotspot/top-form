<script setup>
import { ref, onMounted, computed } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import api from '@/services/api'
import AnimatedStats from '@/components/AnimatedStats.vue'
import StudentsGenderChart from '@/components/StudentsGenderChart.vue'
import AttendanceChart from '@/components/AttendanceChart.vue'
import EarningsChart from '@/components/EarningsChart.vue'
import { supabase } from '@/supabase'

const loading = ref(true)

const viewTeacher = (teacher) => {
  console.log('View:', teacher)
}

const editTeacher = (teacher) => {
  console.log('Edit:', teacher)
}

const deleteTeacher = (teacher) => {
  console.log('Delete:', teacher)
}

const headers = [
  { title: 'Name', value: 'full_name' },
  { title: 'Email', value: 'email' },
  { title: 'Phone', value: 'phone' },
  { title: 'Gender', value: 'gender' },
  { title: 'Subject', value: 'subject_specialization' },
  { title: 'Actions', value: 'actions', sortable: false }
]

const studentsHeaders = [
  { title: 'Name', key: 'full_name' },
  { title: 'Class', key: 'class' },
  { title: 'Marks %', key: 'marks_percent' },
  { title: 'Marks', key: 'rank' }
]

const data = ref({
  students: [],
  teachers: [],
  employees: [],
  revenue: [],
  expenses: [],
  attendance: [],
  earnings: [],
  notifications: [],
})

const fetchData = async (endpoint, key) => {
  try {
    const response = await api.get(`/${endpoint}`)
    data.value[key] = response.data.data
    console.log(`${key}:`, response.data.data)
  } catch (err) {
    console.error(`Error fetching ${key}:`, err)
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

const fetchStudentsWithClasses = async () => {
  const { data: students, error } = await supabase
    .from('students')
    .select(`*, class:classes(name)`)
    .order('full_name', { ascending: true })
  console.log('students with classes:', students)
  if (error) {
    console.log('Supabase error:', error)
    return
  }

  data.value.students = students.map((s) => ({
    ...s,
    class_name: s.class?.name || 'N/A',
    marks_percent: s.marks_percent || Math.floor(Math.random() * 100),
    rank: s.rank || Math.floor(Math.random() * 100)
  }))
}



const fetchAll = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchData('teachers', 'teachers'),
      fetchData('employees', 'employees'),
      fetchData('revenue', 'revenue'),
      fetchData('expenses', 'expenses'),
      fetchAttendanceSummary(),
      fetchEarningsSummary(),
      fetchNotifications(),
      fetchStudentsWithClasses()
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
  return data.value.revenue.reduce((sum, rev) => sum + (rev.amount || 0), 0)
})
onMounted(fetchAll)
</script>

<template>
  <MainLayout>
    <v-container
      v-if="loading"
      class="fill-height d-flex justify-center align-center mx-auto items-center flex"
    >
      <v-progress-circular indeterminate color="success" size="48" />
    </v-container>

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
          iconClass="fas fa-dollar-sign"
          iconBgClass=" text-green-500"
          title="Total Revenue"
          :value="totalRevenue"
          :index="3"
        />
      </div>
      <!-- students by gender & teachers list -->
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
            <h2 class="text-sm font-semibold">Students List</h2>
          </div>
          <div v-if="data.students.length > 0" class="overflow-hidden">
            <v-data-table
              :headers="studentsHeaders"
              :items="data.students"
              :items-per-page="5"
              class="elevation-1"
              fixed-header
              height="300px"
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

              <!-- Action Menu -->
              <template #item.actions="{ item }">
                <v-menu transition="scale-transition" location="top end">
                  <template #activator="{ props }">
                    <v-btn icon variant="text" v-bind="props">
                      <i class="fas fa-ellipsis-v text-gray-600"></i>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="viewStudent(item)">
                      <v-list-item-title>View</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editStudent(item)">
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteStudent(item)">
                      <v-list-item-title class="text-red-500">Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
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
          <AttendanceChart :attendance="data.attendance" />
        </div>
      </div>
    </div>
  </MainLayout>
</template>
