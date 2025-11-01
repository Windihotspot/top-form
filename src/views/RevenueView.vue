<script setup>
import { ref, onMounted, reactive } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import AnimatedStats from '@/components/AnimatedStats.vue'
import Apexchart from 'vue3-apexcharts'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElNotification } from 'element-plus'
import moment from 'moment'
import { useFormattedField } from '@/composables/useFormattedFields.js'
const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id

// ========== DATA REFS ==========
const kpis = ref({
  total_fees_assigned: 0,
  total_collected: 0,
  pending_fees: 0,
  overdue_fees: 0
})

const collectionsByMonth = ref([])
const feesByType = ref([])
const payments = ref([])
// ========== LOADING STATES ==========
const loading = ref(false)
const error = ref(null)
// ====== Dialogs ======
const paymentDialog = ref(false)
const deleteDialog = ref(false)
const dialogMode = ref('add')
const selectedPaymentId = ref(null)
const paymentFormRef = ref(null)
const submitting = ref(false)

const students = ref([])
const classFees = ref([])

const getPayments = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('payments')
      .select(
        `
    id,
    amount,
    method,
    reference,
    payment_date,
    students:student_id (
      id,
      full_name,
      class_id
    ),
    fees:fee_id (
      id,
      description,
      amount
    )
  `
      )
      .eq('school_id', schoolId)
      .order('payment_date', { ascending: false })

    if (error) console.error('Error fetching payments:', error)
    else console.log('Payments:', data)

    // Optional: map flattened fields for easier template use
    payments.value = (data || []).map((p) => ({
      ...p,
      student_name: p.students?.full_name || '—',
      fee_description: p.fees?.description || '—',
      fee_amount: p.fees?.amount || 0
    }))

    console.log('payments:', payments.value)
  } catch (err) {
    ElMessage.error(err.message || 'Failed to load payments.')
    console.log('errro fetching paymnets:', err.message)
  } finally {
    loading.value = false
  }
}

const paymentForm = reactive({
  student_id: '',
  fee_id: '',
  amount: '',
  method: '',
  reference: '',
  payment_date: ''
})

// formatted amount composable (currency)
const formattedPaymentAmount = useFormattedField(paymentForm, 'amount', { currency: true })

// ===== DATE PICKER =====
const dateMenu = ref(false)
const onPaymentDateSelected = (val) => {
  paymentForm.payment_date = moment(val).format('YYYY-MM-DD')
  dateMenu.value = false
}

// ===== LOAD DATA =====
const loadStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('id, full_name, class_id')
    .eq('school_id', schoolId)
  if (!error) students.value = data || []
}

const loadFees = async () => {
  const { data, error } = await supabase
    .from('fees')
    .select('id, description, amount, class_id')
    .eq('school_id', schoolId)
  if (!error) classFees.value = data || []
}

// ========== FUNCTIONS ==========
const getKPIs = async () => {
  const { data, error: err } = await supabase.rpc('get_payments_summary', {
    p_school_id: schoolId
  })

  if (err) {
    error.value = err.message
    return
  }
  if (data) {
    kpis.value = data
    console.log('payments kpis:', data)
  }
}

const getCollectionsByMonth = async () => {
  const { data, error: err } = await supabase.rpc('get_collections_by_month', {
    school_id: schoolId
  })
  if (err) {
    error.value = err.message
    return
  }
  collectionsByMonth.value = data || []
  console.log('collections by month:', data)
}

const getFeesByType = async () => {
  const { data, error: err } = await supabase.rpc('get_payment_methods_distribution', {
    school_id: schoolId
  })
  if (err) {
    error.value = err.message
    return
  }
  feesByType.value = data || []
  console.log('payment methods:', data)
}

// const getRecentTransactions = async () => {
//   const { data, error: err } = await supabase.rpc('get_recent_transactions', {
//     school_id: schoolId
//   })
//   if (err) {
//     error.value = err.message
//     return
//   }
//   recentTransactions.value = data || []
//   console.log('recent payments:', data)
// }

// ========== CHART CONFIG ==========
const collectionsOptions = ref({
  chart: { type: 'line', toolbar: { show: false } },
  noData: {
    text: 'No data available',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      color: '#999',
      fontSize: '16px'
    }
  },
  stroke: { curve: 'smooth' },
  xaxis: { categories: [] },
  colors: ['#6366F1']
})
const collectionsSeries = ref([{ name: 'Collected', data: [] }])

const feesOptions = ref({
  chart: { type: 'donut' },
  noData: {
    text: 'No data available',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      color: '#999',
      fontSize: '16px'
    }
  },
  labels: [],
  legend: { position: 'bottom' },
  colors: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6']
})
const feesSeries = ref([])

// Chart data
const stackedBarData = ref([])
const chartOptions = ref({})
const chartSeries = ref([])

const getCurrentMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const startDate = start.toISOString().split('T')[0] // YYYY-MM-DD
  const endDate = end.toISOString().split('T')[0] // YYYY-MM-DD
  return { startDate, endDate }
}

// Fetch monthly overview
const getFeesOverviewByMonth = async () => {
  const { startDate, endDate } = getCurrentMonthRange()
  const { data, error } = await supabase.rpc('get_fees_overview_by_month', {
    p_school_id: schoolId,
    p_start_date: startDate,
    p_end_date: endDate
  })

  if (error) {
    console.error('Error fetching overview:', error.message)
    return
  }

  stackedBarData.value = data || []
  console.log('overview by month:', data)
  // Build chart series
  chartSeries.value = [
    {
      name: 'Collected',
      data: stackedBarData.value.map((item) => item.collected)
    },
    {
      name: 'Pending',
      data: stackedBarData.value.map((item) => item.pending)
    },
    {
      name: 'Overdue',
      data: stackedBarData.value.map((item) => item.overdue)
    }
  ]

  chartOptions.value = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: true }
    },
    noData: {
      text: 'No data available',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        color: '#999',
        fontSize: '16px'
      }
    },
    plotOptions: {
      bar: { horizontal: false }
    },
    xaxis: {
      categories: stackedBarData.value.map((item) => item.month),
      title: { text: 'Month' }
    },
    yaxis: {
      title: { text: 'Amount' }
    },
    legend: {
      position: 'top'
    },
    fill: { opacity: 1 },
    colors: ['#22c55e', '#f97316', '#ef4444'] // Collected = green, Pending = orange, Overdue = red
  }
}

const openAddDialog = async () => {
  dialogMode.value = 'add'
  selectedPaymentId.value = null
  await Promise.all([loadStudents(), loadFees()])
  resetForm()
  paymentDialog.value = true
}

const openEditDialog = async (payment) => {
  dialogMode.value = 'edit'
  selectedPaymentId.value = payment.id

  // Load only this student's data (instead of all)
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select('id, full_name, class_id')
    .eq('id', payment.students?.id)
    .single()

  if (studentError) console.error('Error fetching student:', studentError)
  else students.value = [studentData] // replace the list with only this student

  // Load all fees as usual (in case they need to pick a new one)
  await loadFees()

  // Prefill form fields
  Object.assign(paymentForm, {
    student_id: payment.students?.id || '',
    fee_id: payment.fees?.id || '',
    amount: payment.amount,
    method: payment.method,
    reference: payment.reference,
    payment_date: payment.payment_date
  })

  paymentDialog.value = true
}

const resetForm = () => {
  Object.assign(paymentForm, {
    student_id: '',
    fee_id: '',
    amount: '',
    method: '',
    reference: '',
    payment_date: ''
  })
}

const closePaymentDialog = () => {
  paymentDialog.value = false
  resetForm()
}

const submitPayment = async () => {
  if (!(await paymentFormRef.value.validate())) return
  try {
    submitting.value = true
    const payload = {
      school_id: schoolId,
      student_id: paymentForm.student_id,
      fee_id: paymentForm.fee_id,
      amount: paymentForm.amount,
      method: paymentForm.method || 'Cash',
      reference: paymentForm.reference || null,
      payment_date: paymentForm.payment_date || new Date().toISOString()
    }

    if (dialogMode.value === 'add') {
      const { error } = await supabase.from('payments').insert([payload])
      if (error) throw error
      ElNotification.success({ title: 'Payment Added', message: 'Payment recorded successfully!' })
      getPayments()
      getKPIs()
    } else {
      const { error } = await supabase
        .from('payments')
        .update(payload)
        .eq('id', selectedPaymentId.value)
      if (error) throw error
      ElNotification.success({ title: 'Updated', message: 'Payment updated successfully!' })
    }

    await getPayments()
    closePaymentDialog()
  } catch (err) {
    ElMessage.error(err.message || 'Failed to save payment.')
  } finally {
    submitting.value = false
  }
}

const paymentToDelete = ref(null)
const confirmDelete = (payment) => {
  paymentToDelete.value = payment
  deleteDialog.value = true
}

const deletePayment = async () => {
  try {
    submitting.value = true
    const { error } = await supabase.from('payments').delete().eq('id', paymentToDelete.value.id)
    if (error) throw error
    ElNotification.success({ title: 'Deleted', message: 'Payment deleted successfully!' })
    await getPayments()
  } catch (err) {
    ElMessage.error(err.message || 'Failed to delete payment.')
  } finally {
    deleteDialog.value = false
    submitting.value = false
  }
}

// ====== HELPERS ======
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)
const formatDate = (date) => moment(date).format('DD MMM YYYY')

// ========== PAGE LOAD ==========
onMounted(async () => {
  loading.value = true
  await Promise.all([
    getKPIs(),
    getCollectionsByMonth(),
    getFeesByType(),
    getPayments(),
    getFeesOverviewByMonth()
  ])
  loading.value = false
})
</script>

<template>
  <MainLayout>
    <div class="px-4 py-2">
      <div class="bg-white flex rounded shadow justify-between items-center border-b p-4 mb-4">
        <div>
          <h1 class="text-xl font-bold mt-4">Payments</h1>
          <p class="text-gray-500 text-sm mt-1">Manage all your payments</p>
        </div>

        <v-btn
          @click="openAddDialog"
          class="normal-case custom-btn hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-md shadow-md"
        >
          <span
            class="bg-white text-blue-600 rounded-full p-1 flex items-center justify-center w-4 h-4 mr-2"
          >
            <i class="fa-solid fa-plus text-sm text-[#214ec8]"></i>
          </span>
          Add a new payment
        </v-btn>
      </div>
    </div>
    <div
      v-if="loading"
      class="fill-height d-flex justify-center align-center mx-auto items-center flex my-auto mx-auto"
    >
      <v-progress-circular indeterminate color="success" size="48" />
    </div>

    <div v-else>
      <!-- Payments Table -->
      <div class="overflow-x-auto bg-white rounded shadow m-4">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Student
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fee</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Method
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Payment Date
              </th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="p in payments" :key="p.id">
              <td class="px-6 py-4">{{ p.student_name || '—' }}</td>
              <td class="px-6 py-4">{{ formatCurrency(p.fee_amount) }}</td>
              <td class="px-6 py-4">{{ formatCurrency(p.amount) }}</td>
              <td class="px-6 py-4">{{ p.method }}</td>
              <td class="px-6 py-4">{{ formatDate(p.payment_date) }}</td>
              <td class="px-6 py-4 text-center flex justify-center gap-4">
                <button @click="openEditDialog(p)" class="text-blue-500 hover:text-blue-700">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button @click="confirmDelete(p)" class="text-red-500 hover:text-red-700">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!payments.length && !loading" class="p-4 text-gray-500">No payments found.</div>
      </div>

      <div class="m-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        <!-- Total Fees Assigned -->
        <AnimatedStats
          iconClass="fas fa-file-invoice-dollar"
          iconBgClass="text-blue-500"
          title="Total Expected fees"
          :value="kpis.total_expected_fees"
          :index="0"
        />

        <!-- Total Collected -->
        <AnimatedStats
          iconClass="fas fa-coins"
          iconBgClass="text-green-500"
          title="Total Collected"
          :value="kpis.total_collected"
          :index="1"
        />

        <!-- Pending Fees -->
        <AnimatedStats
          iconClass="fas fa-clock"
          iconBgClass="text-yellow-500"
          title="Pending Fees"
          :value="kpis.pending_fees"
          :index="2"
        />

        <!-- Overdue Fees -->
        <AnimatedStats
          iconClass="fas fa-exclamation-circle"
          iconBgClass="text-red-500"
          title="Overdue Fees"
          :value="kpis.overdue_fees"
          :index="3"
        />
      </div>

      <!-- Charts Section -->
      <div class="m-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Collections Over Time -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Collections over time</h2>
          <apexchart
            type="line"
            height="300"
            :options="collectionsOptions"
            :series="collectionsSeries"
          />
        </div>

        <!-- Fees by Type -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Payment method distribution</h2>
          <apexchart type="donut" height="300" :options="feesOptions" :series="feesSeries" />
        </div>

        <div class="bg-white shadow-md rounded-lg p-4">
          <h2 class="text-lg font-semibold mb-4">Monthly Fees Overview</h2>
          <apexchart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
        </div>
      </div>
    </div>

    <!-- Add/Edit Payment Dialog -->
    <v-dialog v-model="paymentDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-lg font-bold">
          {{ dialogMode === 'add' ? 'Add New Payment' : 'Edit Payment' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="paymentFormRef">
            <v-select
              v-model="paymentForm.student_id"
              :items="students"
              item-title="full_name"
              item-value="id"
              label="Select Student"
              variant="outlined"
              color="#214ec8"
              :rules="[(v) => !!v || 'Student is required']"
            />

            <v-select
              v-model="paymentForm.fee_id"
              :items="classFees"
              item-title="description"
              item-value="id"
              label="Select Fee"
              class="mt-4"
              variant="outlined"
              color="#214ec8"
              :rules="[(v) => !!v || 'Fee is required']"
            />

            <v-text-field
              v-model="formattedPaymentAmount"
              label="Amount"
              class="mt-4"
              variant="outlined"
              color="#214ec8"
              :rules="[(v) => !!v || 'Amount is required']"
            />

            <v-select
              v-model="paymentForm.method"
              :items="['Cash', 'Transfer', 'POS']"
              label="Payment Method"
              class="mt-4"
              variant="outlined"
              color="#214ec8"
              :rules="[(v) => !!v || 'Method is required']"
            />

            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  v-model="paymentForm.payment_date"
                  label="Payment Date"
                  readonly
                  variant="outlined"
                  color="#214ec8"
                  class="mt-4"
                />
              </template>
              <v-date-picker
                v-model="paymentForm.payment_date"
                @update:modelValue="onPaymentDateSelected"
              />
            </v-menu>

            <v-text-field
              v-model="paymentForm.reference"
              label="Reference (optional)"
              class="mt-4"
              variant="outlined"
              color="#214ec8"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn text @click="closePaymentDialog">Cancel</v-btn>
          <v-btn color="success" class="text-white" :loading="submitting" @click="submitPayment">
            {{ dialogMode === 'add' ? 'Save Payment' : 'Update Payment' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-lg font-bold">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this payment for
          <strong>{{ paymentToDelete?.students?.full_name }}</strong
          >?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red" class="text-white" :loading="submitting" @click="deletePayment">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </MainLayout>
</template>

<style scoped>
.custom-btn {
  background-color: #214ec8;
  text-transform: none;
}
.v-btn {
  text-transform: none;
}
</style>
