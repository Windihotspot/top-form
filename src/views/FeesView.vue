<script setup>
import { ref, reactive, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElNotification } from 'element-plus'
import moment from 'moment'
import { useFormattedField } from '@/composables/useFormattedFields.js'

const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id

// ====== STATE ======
const fees = ref([])
const schoolClasses = ref([])
const terms = ref([])
const loading = ref(false)

const showDialog = ref(false)
const dialogMode = ref('add')
const selectedFeeId = ref(null)
const showDeleteDialog = ref(false)
const feeToDelete = ref(null)

const form = reactive({
  class_id: '',
  term_id: '',
  amount: '',
  description: '',
  due_date: ''
})

const formattedAmount = useFormattedField(form, 'amount', { currency: true })
const isValid = ref(false)
const formRef = ref(null)

// ====== VALIDATION ======
const rules = {
  required: (v) => !!v || 'This field is required'
}

// ====== FETCH DATA ======
const getFees = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('fees')
      .select(`
        id,
        amount,
        description,
        due_date,
        created_at,
        status,
        payment_status,
        classes:class_id (id, name),
        academic_terms:term_id (id, name)
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    if (error) throw error
    fees.value = data || []
  } catch (err) {
    console.error(err)
    ElMessage.error(err.message || 'Failed to load fees.')
  } finally {
    loading.value = false
  }
}

const dateMenu = ref(false)

const onDueDateSelected = (val) => {
  form.due_date = moment(val).format('YYYY-MM-DD')
  dateMenu.value = false
}


const fetchClasses = async () => {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name')
    .eq('school_id', schoolId)
  if (!error) schoolClasses.value = data
}

const fetchTerms = async () => {
  const { data, error } = await supabase
    .from('academic_terms')
    .select('id, name')
  if (!error) terms.value = data
}

// ====== CRUD ======
const openAddDialog = () => {
  dialogMode.value = 'add'
  resetForm()
  showDialog.value = true
}

const openEditDialog = (fee) => {
  dialogMode.value = 'edit'
  selectedFeeId.value = fee.id
  Object.assign(form, {
    class_id: fee.classes?.id || '',
    term_id: fee.academic_terms?.id || '',
    amount: fee.amount,
    description: fee.description,
    due_date: fee.due_date
  })
  showDialog.value = true
}

const resetForm = () => {
  form.class_id = ''
  form.term_id = ''
  form.amount = ''
  form.description = ''
  form.due_date = ''
  selectedFeeId.value = null
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const submitForm = async () => {
  if (!(await formRef.value.validate())) return

  try {
    loading.value = true

    if (dialogMode.value === 'add') {
      const { error } = await supabase.from('fees').insert([
        {
          school_id: schoolId,
          class_id: form.class_id,
          term_id: form.term_id,
          amount: form.amount,
          description: form.description,
          due_date: form.due_date,
          status: 'pending',
          payment_status: 'unpaid'
        }
      ])

      if (error) throw error

      ElNotification.success({
        title: 'Success',
        message: 'Fee added successfully!'
      })
    } else {
      const { error } = await supabase
        .from('fees')
        .update({
          class_id: form.class_id,
          term_id: form.term_id,
          amount: form.amount,
          description: form.description,
          due_date: form.due_date
        })
        .eq('id', selectedFeeId.value)

      if (error) throw error

      ElNotification.success({
        title: 'Updated',
        message: 'Fee updated successfully!'
      })
    }

    await getFees()
    closeDialog()
  } catch (err) {
    // 🧠 Handle the specific unique constraint error from Supabase/Postgres
    if (err.message?.includes('unique_class_fee_per_class')) {
      ElMessage.error('This class already has a fee assigned.')
    } else {
      ElMessage.error(err.message || 'Failed to save fee.')
    }
  } finally {
    loading.value = false
  }
}


const confirmDeleteFee = (fee) => {
  feeToDelete.value = fee
  showDeleteDialog.value = true
}

const performDeleteFee = async () => {
  try {
    loading.value = true
    const { error } = await supabase.from('fees').delete().eq('id', feeToDelete.value.id)
    if (error) throw error
    ElNotification.success({ title: 'Deleted', message: 'Fee deleted successfully!' })
    await getFees()
  } catch (err) {
    ElMessage.error(err.message || 'Failed to delete fee.')
  } finally {
    showDeleteDialog.value = false
    feeToDelete.value = null
    loading.value = false
  }
}

// ====== HELPERS ======
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)
const formatDate = (date) => moment(date).format('DD MMM YYYY')

onMounted(() => {
  getFees()
  fetchClasses()
  fetchTerms()
})
</script>

<template>
  <MainLayout>
    <div class="px-4 py-2">
      <div class="bg-white flex rounded shadow justify-between items-center border-b p-4 mb-4">
        <div>
          <h1 class="text-xl font-bold mt-4">Fees</h1>
          <p class="text-gray-500 text-sm mt-1">Manage all assigned class fees</p>
        </div>

        <v-btn
          @click="openAddDialog"
          class="normal-case custom-btn hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-md shadow-md"
        >
          <span
            class="bg-white text-blue-600 rounded-full p-1 flex items-center justify-center w-4 h-4 mr-2"
          >
            <i class="fa-solid fa-plus text-sm text-[#15803d]"></i>
          </span>
          Add new fee
        </v-btn>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="flex justify-center py-10">
        <v-progress-circular indeterminate color="success" size="48" />
      </div>

      <!-- Fees Table -->
      <div v-else class="overflow-x-auto bg-white rounded shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Class
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Term
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Due Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Description
              </th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="fee in fees" :key="fee.id">
              <td class="px-6 py-4">{{ fee.classes?.name || '—' }}</td>
              <td class="px-6 py-4">{{ fee.academic_terms?.name || '—' }}</td>
              <td class="px-6 py-4">{{ formatCurrency(fee.amount) }}</td>
              <td class="px-6 py-4">{{ formatDate(fee.due_date) }}</td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    fee.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : fee.payment_status === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ fee.payment_status }}
                </span>
              </td>
              <td class="px-6 py-4">{{ fee.description }}</td>
              <td class="px-6 py-4 text-center flex justify-center gap-4">
                <button @click="openEditDialog(fee)" class="text-blue-500 hover:text-blue-700">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button @click="confirmDeleteFee(fee)" class="text-red-500 hover:text-red-700">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!fees.length && !loading" class="p-4 text-gray-500">No fees found.</div>
      </div>

      <!-- Add/Edit Dialog -->
      <v-dialog v-model="showDialog" max-width="600px" persistent>
        <v-card>
          <v-card-title class="text-lg font-bold">
            {{ dialogMode === 'add' ? 'Add New Fee' : 'Edit Fee' }}
          </v-card-title>

          <v-card-text>
            <v-form ref="formRef" v-model="isValid">
              <v-select
                v-model="form.class_id"
                :items="schoolClasses"
                item-title="name"
                item-value="id"
                label="Select Class"
                variant="outlined"
                color="#15803d"
                :rules="[rules.required]"
              />
              <v-select
                v-model="form.term_id"
                :items="terms"
                item-title="name"
                item-value="id"
                label="Select Term"
                class="mt-4"
                variant="outlined"
                color="#15803d"
                :rules="[rules.required]"
              />
              <v-text-field
                v-model="formattedAmount"
                label="Amount"
                class="mt-4"
                variant="outlined"
                color="#15803d"
                :rules="[rules.required]"
              />
              <v-menu
  v-model="dateMenu"
  :close-on-content-click="false"
  transition="scale-transition"
  offset-y
  max-width="290px"
  min-width="auto"
>
  <template #activator="{ props }">
    <v-text-field
      v-bind="props"
      v-model="form.due_date"
      label="Due Date"
      readonly
      variant="outlined"
      color="#15803d"
      :rules="[rules.required]"
    />
  </template>
  <v-date-picker
    v-model="form.due_date"
    @update:modelValue="onDueDateSelected"
  />
</v-menu>

              <v-textarea
                v-model="form.description"
                label="Description"
                class="mt-4"
                variant="outlined"
                color="#15803d"
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

      <!-- Delete Confirmation -->
      <v-dialog v-model="showDeleteDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-lg font-bold">Confirm Delete</v-card-title>
          <v-card-text>
            Are you sure you want to delete this fee for
            <strong>{{ feeToDelete?.classes?.name }}</strong> –
            {{ formatCurrency(feeToDelete?.amount) }}?
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn text @click="showDeleteDialog = false">Cancel</v-btn>
            <v-btn color="red" class="text-white" @click="performDeleteFee">Delete</v-btn>
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
.v-btn {
  text-transform: none;
}
</style>
