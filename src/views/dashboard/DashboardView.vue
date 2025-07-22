<script setup>
import { ref, onMounted, computed } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import api from '@/services/api'
import AnimatedStats from '@/components/AnimatedStats.vue'
import StudentsGenderChart from '@/components/StudentsGenderChart.vue'

const viewTeacher = (teacher) => {
  console.log('View:', teacher)
}

const editTeacher = (teacher) => {
  console.log('Edit:', teacher)
}

const deleteTeacher = (teacher) => {
  console.log('Delete:', teacher)
}

const data = ref({
  students: [],
  teachers: [],
  employees: [],
  revenue: [],
  expenses: [],
  attendance: []
})

const fetchData = async (endpoint, key) => {
  try {
    const response = await api.get(`/${endpoint}`)
    data.value[key] = response.data.data
    console.log(`${key} fetched:`, response.data.data)
  } catch (err) {
    console.error(`Error fetching ${key}:`, err)
  }
}

const fetchAll = async () => {
  await Promise.all([
    fetchData('students', 'students'),
    fetchData('teachers', 'teachers'),
    fetchData('employees', 'employees'),
    fetchData('revenue', 'revenue'),
    fetchData('expenses', 'expenses'),
    fetchData('attendance', 'attendance')
  ])
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
    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 ">
      <!-- students by Gender -->
      <div class="p-4 bg-white rounded">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-semibold">Students by Gender</h2>
        </div>
        <div>
          <StudentsGenderChart :students="data.students" />
        </div>
      </div>

      <!-- Teachers List -->
      <div class="bg-white p-4 rounded">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-semibold">Teachers List</h2>
        </div>

        <div v-if="data.teachers.length > 0" class="overflow-x-auto">
          <table class="min-w-full text-xs text-left text-gray-500">
            <thead class="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th class="px-4 py-2">Name</th>
                <th class="px-4 py-2">Email</th>
                <th class="px-4 py-2">Phone</th>
                <th class="px-4 py-2">Gender</th>
                <th class="px-4 py-2">Subject</th>
                <th class="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="teacher in data.teachers"
                :key="teacher.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="px-4 py-2">{{ teacher.full_name }}</td>
                <td class="px-4 py-2">{{ teacher.email }}</td>
                <td class="px-4 py-2">{{ teacher.phone }}</td>
                <td class="px-4 py-2">{{ teacher.gender }}</td>
                <td class="px-4 py-2">{{ teacher.subject_specialization }}</td>
                <td class="px-4 py-2 text-center">
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center text-gray-500 py-4">No teachers found.</div>
      </div>
    </div>
  </MainLayout>
</template>
