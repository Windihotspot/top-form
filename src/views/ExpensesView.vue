<script setup>
import { ref, onMounted, reactive } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'
import { useFormattedField } from '@/composables/useFormattedFields.js'
import { ElMessage, ElNotification } from 'element-plus'
import moment from 'moment'

const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id
const adminId = authStore.admin?.id

// ---- State ----
const expenses = ref([])
const categories = ref([])
const loading = ref(false)
const errorMessage = ref(null)

const showDialog = ref(false)
const dialogMode = ref('add') // 'add' | 'edit'
const selectedExpenseId = ref(null)

const showDeleteDialog = ref(false)
const expenseToDelete = ref(null)

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

const formattedAmount = useFormattedField(form, 'amount', { currency: true })

// ---- Validation ----
const rules = {
  required: (v) => !!v || 'This field is required',
  number: (v) => (!isNaN(parseFloat(v)) && v >= 0) || 'Must be a valid number'
}

// ---- Helpers ----
const resetForm = () => {
  Object.assign(form, {
    category: '',
    vendor: '',
    amount: null,
    payment_method: '',
    date: '',
    description: ''
  })
  selectedExpenseId.value = null
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  resetForm()
  showDialog.value = true
}

const openEditDialog = (expense) => {
  dialogMode.value = 'edit'
  selectedExpenseId.value = expense.id
  Object.assign(form, {
    category: expense.category,
    vendor: expense.vendor,
    amount: expense.amount,
    payment_method: expense.payment_method,
    date: expense.date,
    description: expense.description
  })
  showDialog.value = true
}

// ---- Submit ----
const submitForm = async () => {
  if (!(await formRef.value.validate())) return

  const payload = {
    amount: form.amount,
    category: form.category,
    date: form.date,
    description: form.description,
    payment_method: form.payment_method,
    vendor: form.vendor,
    expense_id: selectedExpenseId.value || null
  }

  try {
    loading.value = true
    if (dialogMode.value === 'add') {
      await addExpense(payload)
      ElNotification.success({
        title: 'Success',
        message: 'Expense added successfully!'
      })
    } else {
      await updateExpense(payload)
      ElNotification.success({
        title: 'Success',
        message: 'Expense updated successfully!'
      })
    }
    await getExpenses()
    closeDialog()
  } catch (error) {
    ElMessage.error(error.message || 'Failed to save expense.')
  } finally {
    loading.value = false
  }
}

// ---- Delete ----
const confirmDeleteExpense = (expense) => {
  expenseToDelete.value = expense
  showDeleteDialog.value = true
}

const performDeleteExpense = async () => {
  try {
    loading.value = true
    await deleteExpense(expenseToDelete.value.id)
    ElNotification.success({
      title: 'Deleted',
      message: 'Expense deleted successfully!'
    })
    await getExpenses()
  } catch (err) {
    ElMessage.error(err.message || 'Failed to delete expense.')
  } finally {
    loading.value = false
    showDeleteDialog.value = false
    expenseToDelete.value = null
  }
}

// ---- Supabase RPC wrappers ----
const callManageExpense = async (action, params = {}) => {
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
  if (error) throw error
  return data
}

const getExpenses = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('school_id', schoolId)
      .order('date', { ascending: false })

    if (error) throw error
    expenses.value = data || []
    return data
  } catch (err) {
    ElMessage.error(err.message || 'Failed to fetch expenses.')
    expenses.value = []
  } finally {
    loading.value = false
  }
}

const addExpense = (params) => callManageExpense('add', params)
const updateExpense = (params) => callManageExpense('update', params)
const deleteExpense = (expenseId) => callManageExpense('delete', { expense_id: expenseId })

const fetchExpenseCategories = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('school_id', schoolId)
      .order('name', { ascending: true })

    if (error) throw error
    categories.value = data || []
  } catch (err) {
    ElMessage.error(err.message || 'Failed to fetch categories.')
    categories.value = []
  } finally {
    loading.value = false
  }
}

// ---- Formatters ----
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)

const formatDate = (date) => moment(date).format('DD MMM YYYY')

// ---- Init ----
onMounted(() => {
  getExpenses()
  fetchExpenseCategories()
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
          @click="openAddDialog"
          size="medium"
          class="normal-case custom-btn hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-md shadow-md"
        >
          <span
            class="bg-white text-blue-600 rounded-full p-1 flex items-center justify-center w-4 h-4 mr-2"
          >
            <i class="fa-solid fa-plus text-sm text-[#214ec8]"></i>
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
              <td class="px-6 py-4 whitespace-nowrap text-center flex gap-4 justify-center space-x-2">
                <button @click="openEditDialog(expense)" class="text-blue-500 hover:text-blue-700">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button
                  @click="confirmDeleteExpense(expense)"
                  class="text-red-500 hover:text-red-700"
                >
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
          <v-card-title class="text-lg font-bold">
            {{ dialogMode === 'add' ? 'Add New Expense' : 'Edit Expense' }}
          </v-card-title>
          <v-card-text>
            <v-form ref="formRef" v-model="isValid">
              <!-- Category -->
              <v-select
                variant="outlined"
                color="#214ec8"
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
                color="#214ec8"
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
                color="#214ec8"
                v-model="formattedAmount"
                label="Amount"
                :rules="[rules.required]"
                required
              />

              <!-- Payment Method -->
              <v-select
                class="mt-4"
                variant="outlined"
                color="#214ec8"
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
                color="#214ec8"
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
                color="#214ec8"
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
              {{ dialogMode === 'add' ? 'Save' : 'Update' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- delete confirmation modal -->
      <v-dialog v-model="showDeleteDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-lg font-bold">Confirm Delete</v-card-title>
          <v-card-text>
            Are you sure you want to delete this expense?
            <strong>{{ expenseToDelete?.category }}</strong> –
            {{ formatCurrency(expenseToDelete?.amount) }}
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn text @click="showDeleteDialog = false">Cancel</v-btn>
            <v-btn color="red" class="text-white" @click="performDeleteExpense">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </MainLayout>
</template>

<style scoped>
.custom-btn {
  background-color: #214ec8;
  text-transform: none;
}
.v-btn{
  text-transform: none;
}
</style>
