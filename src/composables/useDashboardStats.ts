import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
const approvalRiskLabels = ['very low', 'low', 'medium', 'high', 'very high']
const approvalRiskColors = ['#1D7F3C', '#3B82F6', '#D9E86C', '#FCA5A5', '#DC2626']

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

function getMonthlyData(source, months: number[]) {
  const dataMap = new Map(source.map(({ month, count }) => [month, count]))
  return months.map((month) => dataMap.get(month) ?? 0)
}

export function useDashboardStats() {
  const userStore = useUserStore()

  const stats = computed(() => userStore.dashboardStats ?? {})

  const approvalRiskData = computed(() => stats.value.accepted_credit_jobs_by_risk_level ?? [])

  // ✅ Simplified static bar chart for approval risk levels (no month info)
  const approvalChartSeries = computed(() => [
    {
      name: 'Approved Jobs',
      data: approvalRiskLabels.map((label) => {
        const match = approvalRiskData.value.find((item) => item.risk_level.toLowerCase() === label)
        return match ? match.count : 0
      })
    }
  ])

  const approvalChartOptions = computed(() => ({
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 4,
        distributed: true
      }
    },
    xaxis: {
      categories: approvalRiskLabels, // still required for correct bar positions/colors
      labels: {
        show: false // 👈 hides the x-axis text
      }
    },
    yaxis: {
    
      labels: {
        show: false 
      }
    },
    colors: approvalRiskColors,
    dataLabels: {
      enabled: false
    },
    grid: {
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false // disables X-axis grid lines
        }
      },
      yaxis: {
        lines: {
          show: false // keep Y-axis grid lines if needed
        }
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      theme: 'light'
    }
  }))

  const totalApplications = computed(() => stats.value.total_jobs ?? 0)
  const totalAccepted = computed(() => stats.value.total_accepted_jobs ?? 0)
  const totalDeclined = computed(() => stats.value.total_rejected_jobs ?? 0)
  const totalErrors = computed(() => stats.value.total_failed_jobs ?? 0)
  const percentageAccepted = computed(() => stats.value?.percentage_increase_accepted_job ?? 0)

  const accepted = computed(() => stats.value.accepted_jobs_by_month ?? [])
  const rejected = computed(() => stats.value.rejected_jobs_by_months ?? [])

  const monthNumbers = computed(() => {
    const set = new Set()
    accepted.value.forEach((item) => set.add(item.month))
    rejected.value.forEach((item) => set.add(item.month))
    return [...set].sort((a, b) => a - b)
  })

  const categories = computed(() => monthNumbers.value.map((m) => monthNames[m - 1]))

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
    stroke: { curve: 'smooth', width: [1, 2] },
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
        formatter: (val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val),
        style: { colors: '#6b7280', fontSize: '14px' }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false // disables X-axis grid lines
        }
      },
      yaxis: {
        lines: {
          show: false // keep Y-axis grid lines if needed
        }
      }
    },

    legend: {
      position: 'top',
      horizontalAlign: 'right',
      markers: { width: 10, height: 10, radius: 50 }
    },
    tooltip: { theme: 'light' }
  }))

  const locationLabels = computed(() => stats.value.jobs_by_location?.map((loc) => loc.state) ?? [])
  const locationSeries = computed(() => stats.value.jobs_by_location?.map((loc) => loc.count) ?? [])

  const locationChartOptions = computed(() => ({
    labels: locationLabels.value,
    colors: ['#1E1E1E', '#8BB5FF', '#A8E6CF', '#CBD5E1'],
    dataLabels: { enabled: false },
    legend: {
      position: 'right',
      formatter: (val, opts) => `${val} - ${locationSeries.value[opts.seriesIndex]}`
    },
    stroke: { show: false },
    chart: { toolbar: { show: false } },
    plotOptions: { pie: { donut: { size: '65%' } } }
  }))

  const osLabels = computed(() => stats.value.jobs_by_os?.map((os) => os.user_agent) ?? [])
  const osData = computed(() => stats.value.jobs_by_os?.map((os) => os.count) ?? [])
  const osColorMap = {
    'Safari/17.0': '#99F6E4', // Mint (e.g. Mac)
    'Chrome/120.0': '#8b8bba', // Sky Blue (e.g. Windows)
    'OneUi/7.0': '#BFDBFE', // Light Blue (e.g. Android)
    'DummyAgent/1.0': '#000000' // Black (e.g. Unknown/Other)
  }

  const osColors = computed(
    () => osLabels.value.map((label) => osColorMap[label] ?? '#E5E7EB') // fallback to light gray
  )

  const deviceSeries = computed(() => [{ name: 'Jobs', data: osData.value }])

  const deviceChartOptions = computed(() => ({
    chart: { toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 3, columnWidth: '40%', distributed: true } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: osLabels.value,
      labels: { style: { colors: '#6B7280' } },
      axisBorder: { show: false }, // removes bottom line
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val),

        style: { colors: '#6B7280' }
      }
    },

    grid: {
      strokeDashArray: 0, // make all lines solid
      xaxis: {
        lines: {
          show: false // disables X-axis grid lines
        }
      },
      yaxis: {
        lines: {
          show: false // keep Y-axis grid lines if needed
        }
      }
    },
    colors: osColors.value,
    legend: { show: false }
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
    approvalRiskColors,
    percentageAccepted
  }
}
