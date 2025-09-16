<script setup>
import { ref, onMounted, reactive } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id
const adminId = authStore.admin?.id
import { useFormattedField } from '@/composables/useFormattedFields.js'
import { ElMessage } from 'element-plus'
import moment from 'moment'
const expenses = ref([])
const loading = ref(false)
const errorMessage = ref(null)

const showDialog = ref(false)
const form = reactive({
  category: '',
  vendor: '',
  amount: null,
  payment_method: '',
  date: '',
  description: ''
})
const isValid = ref(false)
const formRef = ref(null)
// use the composable for currency formatting
const formattedAmount = useFormattedField(form, 'amount', { currency: true })
const rules = {
  required: (v) => !!v || 'This field is required',
  number: (v) => (!isNaN(parseFloat(v)) && v >= 0) || 'Must be a valid number'
}

const closeDialog = () => {
  showDialog.value = false
  Object.assign(form, {
    category: '',
    vendor: '',
    amount: null,
    payment_method: '',
    date: '',
    description: ''
  })
}

const submitForm = async () => {
  if (!(await formRef.value.validate())) return
  // 🔹 log the payload
  const payload = {
    amount: form.amount,
    category: form.category,
    date: form.date,
    description: form.description,
    payment_method: form.payment_method,
    vendor: form.vendor
  }
  console.log('Submitting payload:', payload)
  closeDialog()

  try {
    ElMessage({
      message: 'Saving expense...',
      type: 'info',
      duration: 2000
    })

    // 🔹 Pass in the right fields explicitly
    const result = await addExpense(payload)
    console.log(result)
    if (result) {
      ElMessage({
        message: 'Expense saved successfully!',
        type: 'success',
        duration: 2000
      })

      await getExpenses() // refresh list
      closeDialog()
    }
  } catch (error) {
    ElMessage.error('Failed to save expense. Please try again.')
  }
}

// 🔹 Base call wrapper
const callManageExpense = async (action, params = {}) => {
  loading.value = true
  errorMessage.value = null
  try {
    const { data, error } = await supabase.rpc('manage_expense', {
      p_action: action,
      p_admin_id: adminId,
      p_amount: params.amount || null,
      p_category: params.category || null,
      p_date: params.date || null,
      p_description: params.description || null,
      p_expense_id: params.expense_id || null,
      p_payment_method: params.payment_method || null,
      p_school_id: schoolId,
      p_vendor: params.vendor || null
    })
    console.log('manage expense data:', data)
    if (error) throw error
    return data
  } catch (err) {
    console.error('manage_expense error:', err)
    errorMessage.value = err.message
    return null
  } finally {
    loading.value = false
  }
}

// 🔹 CRUD actions
const getExpenses = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const { data, error } = await supabase.from('expenses').select('*').eq('school_id', schoolId)

    if (error) throw error
    expenses.value = data
    console.log('expenses:', expenses.value)
    return data
  } catch (err) {
    console.error('getExpenses error:', err)
    errorMessage.value = err.message
    return null
  } finally {
    loading.value = false
  }
}

const addExpense = (params) => callManageExpense('add', params)

const updateExpense = async (payload) => {
  return await callManageExpense('update', payload)
}

const deleteExpense = async (expenseId, schoolId) => {
  return await callManageExpense('delete', {
    expense_id: expenseId,
    school_id: schoolId
  })
}

const categories = ref([])

const fetchExpenseCategories = async (schoolId) => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('school_id', schoolId) // 👈 only this school's categories
      .order('name', { ascending: true })

    if (error) throw error

    categories.value = data
    console.log('school expense categories:', data)

    return data
  } catch (err) {
    console.error('fetchExpenseCategories error:', err)
    return []
  }
}

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(value)
}

// Format date
const formatDate = (date) => {
  return moment(date).format('DD MMM YYYY')
}

onMounted(() => {
  getExpenses()
  fetchExpenseCategories(schoolId)
})
</script>

<template>
  <MainLayout>
    <div class="px-4 py-2">
      <div class="bg-white flex rounded shadow justify-between items-center border-b p-4 mb-4">
        <div class="mb-2">
          <h1 class="text-xl font-bold mt-4">Expenses</h1>
          <p class="text-gray-500 text-sm mt-1">View and Manage your expenses</p>
        </div>

        <v-btn
          @click="showDialog = true"
          size="medium"
          class="normal-case custom-btn hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-md shadow-md"
        >
          <span
            class="bg-white text-blue-600 rounded-full p-1 flex items-center justify-center w-4 h-4 mr-2"
          >
            <i class="fa-solid fa-plus text-sm text-[#15803d]"></i>
          </span>
          Add new expenses
        </v-btn>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="fill-height d-flex justify-center align-center mx-auto items-center flex my-auto mx-auto"
      >
        <v-progress-circular indeterminate color="success" size="48" />
      </div>

      <div v-else class="overflow-x-auto bg-white rounded shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vendor
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment Method
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="expense in expenses" :key="expense.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ expense.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ expense.vendor }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatCurrency(expense.amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ expense.payment_method }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(expense.date) }}</td>
              <!-- Inside <tbody> for each expense -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    expense.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : expense.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : expense.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ expense.status }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">{{ expense.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center flex justify-center space-x-2">
                <button @click="editExpense(expense)" class="text-blue-500 hover:text-blue-700">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button @click="deleteExpense(expense.id)" class="text-red-500 hover:text-red-700">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!expenses.length && !loading" class="p-4 text-gray-500">No expenses found.</div>
      </div>

      <!-- Add Expense Dialog -->
      <v-dialog v-model="showDialog" max-width="600px" persistent>
        <v-card>
          <v-card-title class="text-lg font-bold">Add New Expense</v-card-title>
          <v-card-text>
            <v-form ref="formRef" v-model="isValid">
              <!-- Category -->
              <v-select
                variant="outlined"
                color="#15803d"
                v-model="form.category"
                :items="categories"
                item-value="description"
                item-title="description"
                label="Select Expense Category"
                :rules="[(v) => !!v || 'Please select a category']"
              >
              </v-select>

              <!-- Vendor -->
              <v-text-field
                class="mt-4"
                color="#15803d"
                variant="outlined"
                v-model="form.vendor"
                label="Vendor name"
                :rules="[rules.required]"
                required
              />

              <!-- Amount -->
              <v-text-field
                class="mt-4"
                variant="outlined"
                color="#15803d"
                v-model="formattedAmount"
                label="Amount"
                :rules="[rules.required]"
                required
              />

              <!-- Payment Method -->
              <v-select
                class="mt-4"
                variant="outlined"
                color="#15803d"
                v-model="form.payment_method"
                :items="['Cash', 'Bank', 'Card', 'Mobile', 'Other']"
                label="Payment Method"
                :rules="[rules.required]"
                required
              />

              <!-- Date -->
              <v-text-field
                class="mt-4"
                variant="outlined"
                color="#15803d"
                v-model="form.date"
                label="Date"
                type="date"
                :rules="[rules.required]"
                required
              />

              <!-- Description -->
              <v-textarea
                class="mt-4"
                variant="outlined"
                color="#15803d"
                v-model="form.description"
                label="Description"
                :rules="[rules.required]"
                auto-grow
                required
              />
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn text @click="closeDialog">Cancel</v-btn>
            <v-btn
              color="success"
              class="text-white"
              :disabled="!isValid || loading"
              @click="submitForm"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </MainLayout>
</template>

<style scoped>
.custom-btn {
  background-color: #15803d;
  text-transform: none;
}
</style>
