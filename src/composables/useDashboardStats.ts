import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
const approvalRiskLabels = ['very low', 'low', 'medium', 'high', 'very high']
const approvalRiskColors = ['#1D7F3C', '#3B82F6', '#D9E86C', '#FCA5A5', '#DC2626']

const approvalChartSeries = [
  { name: 'very low', data: [40, 38, 41, 42, 39, 40] },
  { name: 'low', data: [10, 0, 9, 9, 0, 8] },
  { name: 'medium', data: [20, 19, 20, 20, 18, 19] },
  { name: 'high', data: [10, 0, 10, 10, 0, 9] },
  { name: 'very high', data: [10, 0, 10, 10, 0, 9] }
]

const approvalChartOptions = {
  chart: { stacked: true, toolbar: { show: false } },
  colors: approvalRiskColors,
  xaxis: {
    categories: ['May 1', 'May 2', 'May 3', 'May 4', 'May 5', 'May 6'],
    labels: { style: { colors: '#4B5563' } }
  },
  yaxis: {
    labels: { style: { colors: '#4B5563' } }
  },
  legend: { show: false },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
  grid: { strokeDashArray: 4 },
  dataLabels: { enabled: false }
}

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

function getMonthlyData(source, months: number[]) {
  const dataMap = new Map(source.map(({ month, count }) => [month, count]))
  return months.map((month) => dataMap.get(month) ?? 0)
}

export function useDashboardStats() {
  const userStore = useUserStore()

  const stats = computed(() => userStore.dashboardStats ?? {})

  const totalApplications = computed(() => stats.value.total_jobs ?? 0)
  const totalAccepted = computed(() => stats.value.total_accepted_jobs ?? 0)
  const totalDeclined = computed(() => stats.value.total_rejected_jobs ?? 0)
  const totalErrors = computed(() => 0) // Placeholder

  const accepted = computed(() => stats.value.accepted_jobs_by_month ?? [])
  const rejected = computed(() => stats.value.rejected_jobs_by_months ?? [])

  const monthNumbers = computed(() => {
    const set = new Set()
    accepted.value.forEach(item => set.add(item.month))
    rejected.value.forEach(item => set.add(item.month))
    return [...set].sort((a, b) => a - b)
  })

  const categories = computed(() => monthNumbers.value.map(m => monthNames[m - 1]))

  const series = computed(() => [
    {
      name: 'Accept',
      data: getMonthlyData(accepted.value, monthNumbers.value)
    },
    {
      name: 'Reject',
      data: getMonthlyData(rejected.value, monthNumbers.value)
    }
  ])

  const chartOptions = computed(() => ({
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: [1, 2], dashArray: [0, 5] },
    colors: ['#22c55e', '#ef4444'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categories.value,
      labels: { style: { colors: '#6b7280', fontSize: '14px' } }
    },
    yaxis: {
      labels: {
        formatter: val => `${Math.round(val / 1000)}K`,
        style: { colors: '#6b7280', fontSize: '14px' }
      }
    },
    grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      markers: { width: 10, height: 10, radius: 50 }
    },
    tooltip: { theme: 'light' }
  }))

  const locationLabels = computed(() =>
    stats.value.jobs_by_location?.map(loc => loc.state) ?? []
  )
  const locationSeries = computed(() =>
    stats.value.jobs_by_location?.map(loc => loc.count) ?? []
  )

  const locationChartOptions = computed(() => ({
    labels: locationLabels.value,
    colors: ['#1E1E1E', '#8BB5FF', '#A8E6CF', '#CBD5E1'],
    dataLabels: { enabled: false },
    legend: {
      position: 'right',
      formatter: (val, opts) =>
        `${val} - ${locationSeries.value[opts.seriesIndex]}`
    },
    stroke: { show: false },
    chart: { toolbar: { show: false } },
    plotOptions: { pie: { donut: { size: '65%' } } }
  }))

  const osLabels = computed(() =>
    stats.value.jobs_by_os?.map(os => os.user_agent) ?? []
  )
  const osData = computed(() =>
    stats.value.jobs_by_os?.map(os => os.count) ?? []
  )

  const deviceSeries = computed(() => [
    { name: 'Jobs', data: osData.value }
  ])

  const deviceChartOptions = computed(() => ({
    chart: { toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '40%' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: osLabels.value,
      labels: { style: { colors: '#6B7280' } }
    },
    yaxis: {
      labels: {
        formatter: (val) => `${(val / 1000).toFixed(0)}K`,
        style: { colors: '#6B7280' }
      }
    },
    colors: ['#A78BFA', '#99F6E4', '#000000', '#93C5FD', '#BFDBFE', '#86EFAC'],
    grid: { strokeDashArray: 4 }
  }))

  return {
    totalApplications,
    totalAccepted,
    totalDeclined,
    totalErrors,
    series,
    chartOptions,
    categories,
    locationLabels,
    locationSeries,
    locationChartOptions,
    osLabels,
    osData,
    deviceSeries,
    deviceChartOptions,
     approvalChartSeries,
  approvalChartOptions,
  approvalRiskLabels,
  approvalRiskColors
  }
}
