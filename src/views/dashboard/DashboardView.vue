<script setup>
import { ref, onMounted, computed } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import api from '@/services/api'
import AnimatedStats from '@/components/AnimatedStats.vue'

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
  </MainLayout>
</template>