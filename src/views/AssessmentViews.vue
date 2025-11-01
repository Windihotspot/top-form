<script setup>
import { ref, reactive, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElNotification } from 'element-plus'
import { useRouter } from 'vue-router'
import moment from 'moment'

const router = useRouter()
const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id

const assessments = ref([])
const loading = ref(false)
const showDeleteDialog = ref(false)
const assessmentToDelete = ref(null)

const getAssessments = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
    .from('assessment_full_view')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
    if (error) throw error
    assessments.value = data || []
  } catch (err) {
    ElMessage.error(err.message || 'Failed to load assessments')
  } finally {
    loading.value = false
  }
}

const confirmDeleteAssessment = (assessment) => {
  assessmentToDelete.value = assessment
  showDeleteDialog.value = true
}

const performDeleteAssessment = async () => {
  try {
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessmentToDelete.value.assessment_id)
    if (error) throw error

    ElNotification.success({
      title: 'Deleted',
      message: 'Assessment deleted successfully!'
    })

    await getAssessments()
  } catch (err) {
    ElMessage.error(err.message || 'Failed to delete assessment.')
  } finally {
    showDeleteDialog.value = false
    assessmentToDelete.value = null
  }
}

const viewAssessment = (assessment) => {
  router.push(`/assessments/${assessment.assessment_id}`)
}

const editAssessment = (assessment) => {
  router.push(`/assessments/edit/${assessment.assessment_id}`)
}

const formatDate = (date) => moment(date).format('DD MMM YYYY')

onMounted(() => getAssessments())
</script>

<template>
  <MainLayout>
    <div class="px-4 py-2">
      <div class="bg-white flex rounded shadow justify-between items-center border-b p-4 mb-4">
        <div>
          <h1 class="text-xl font-bold mt-4">Assessments</h1>
          <p class="text-gray-500 text-sm mt-1">Manage all assessments</p>
        </div>

        <v-btn
          to="/assessments/create"
          class="normal-case custom-btn hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-md shadow-md"
        >
          <i class="fa-solid fa-plus mr-2"></i>
          Add Assessment
        </v-btn>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="flex justify-center py-10">
        <v-progress-circular indeterminate color="success" size="48" />
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto bg-white rounded shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Term</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Questions</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="a in assessments" :key="a.assessment_id">
              <td class="px-6 py-4 font-medium">{{ a.title }}</td>
              <td class="px-6 py-4">{{ a.class_name }}</td>
              <td class="px-6 py-4">{{ a.term_name }}</td>
              <td class="px-6 py-4 capitalize">{{ a.assessment_type }}</td>
              <td class="px-6 py-4">{{ a.total_questions }}</td>
              <td class="px-6 py-4">{{ formatDate(a.created_at) }}</td>

              <td class="px-6 py-4 text-center flex justify-center gap-4">
                <button @click="viewAssessment(a)" class="text-green-600 hover:text-green-800">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button @click="editAssessment(a)" class="text-blue-500 hover:text-blue-700">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button @click="confirmDeleteAssessment(a)" class="text-red-500 hover:text-red-700">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!assessments.length && !loading" class="p-4 text-gray-500">No assessments found.</div>
      </div>

      <!-- Delete Confirmation -->
      <v-dialog v-model="showDeleteDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-lg font-bold">Confirm Delete</v-card-title>
          <v-card-text>
            Are you sure you want to delete
            <strong>{{ assessmentToDelete?.title }}</strong>?
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn text @click="showDeleteDialog = false">Cancel</v-btn>
            <v-btn color="red" class="text-white" @click="performDeleteAssessment">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </MainLayout>
</template>

<style scoped>
.custom-btn {
  background-color: #214ec8;
}
</style>
