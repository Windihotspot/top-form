<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import AttendanceTrendsChart from '@/components/AttendanceChart.vue'
import { supabase } from '@/supabase.js'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id

// Refs to hold fetched data
const trends = ref([])
const dailySummary = ref([])
const individualLogs = ref([])
const breakdown = ref([])

// Define a date range for trends
const today = new Date()
const startDate = new Date(today)
startDate.setDate(today.getDate() - 30) // 30 days ago

const toISO = (d) => d.toISOString().slice(0, 10)

const loadAttendanceData = async () => {
  // Fetch trends
  const { data: trendData, error: trendError } = await supabase.rpc('get_attendance_trends', {
    start_date: toISO(startDate),
    end_date: toISO(today),
    school_id: schoolId
  })
  console.log('Attendance Trends:', trendData, trendError)

  // Daily summary
  const { data: summaryData, error: summaryError } = await supabase.rpc(
    'get_attendance_summary_by_day',
    {
      input_school_id: schoolId,
      input_month: new Date().getMonth() + 1, // JS months are 0-indexed
      input_year: new Date().getFullYear()
    }
  )

  console.log('Daily Summary:', summaryData, summaryError)

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
    { school_id: schoolId,  summary_date: new Date(today.getFullYear(), today.getMonth(), 1) }
  )
  console.log('Breakdown:', breakdownData, breakdownError)

  // Assign values to refs
  if (!trendError) trends.value = trendData
  if (!summaryError) dailySummary.value = summaryData
  if (!logsError) individualLogs.value = logsData
  if (!breakdownError) breakdown.value = breakdownData
}

onMounted(() => {
  loadAttendanceData()
})
</script>

<template>
  <MainLayout>
    <div>Attendance</div>
    <div>
        <AttendanceTrendsChart :trends="trends.value"/>
       

    </div>
  </MainLayout>
</template>

<style scoped></style>
