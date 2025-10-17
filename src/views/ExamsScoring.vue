<script setup>
import { ref, reactive, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'
import { ElNotification, ElMessage } from 'element-plus'
import moment from 'moment'

const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id
const adminId = authStore.admin?.id

// ---- State ----
const exams = ref([])
const students = ref([])
const scores = ref([])
const loading = ref(false)
const showDialog = ref(false)
const dialogMode = ref('add') // add | edit
const selectedExamId = ref(null)
const selectedScoreId = ref(null)
const scoreToDelete = ref(null)
const showDeleteDialog = ref(false)

// ---- Form ----
const form = reactive({
  student_id: '',
  subject_id: '',
  score: '',
  remarks: ''
})

const isValid = ref(false)
const formRef = ref(null)

// ---- Helpers ----
const resetForm = () => {
  Object.assign(form, {
    student_id: '',
    subject_id: '',
    score: '',
    remarks: ''
  })
  selectedScoreId.value = null
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

const openEditDialog = (score) => {
  dialogMode.value = 'edit'
  selectedScoreId.value = score.id
  Object.assign(form, {
    student_id: score.student_id,
    subject_id: score.subject_id,
    score: score.score,
    remarks: score.remarks
  })
  showDialog.value = true
}

// ---- Fetch ----
const getExams = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('exam_papers')
      .select('id, title, exam_date')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    if (error) throw error
    exams.value = data || []
  } catch (err) {
    ElMessage.error(err.message || 'Failed to fetch exams.')
  } finally {
    loading.value = false
  }
}
const subjects = ref([])

const getSubjectsForStudent = async () => {
  if (!form.student_id) return

  try {
    const student = students.value.find(s => s.id === form.student_id)
    if (!student?.class_id) {
      subjects.value = []
      return
    }

    const { data, error } = await supabase
      .from('class_subjects_view')
      .select('subject_id, subject_name')
      .eq('class_id', student.class_id)
      .eq('school_id', schoolId)
    console.log("subjects:", data)
    if (error) throw error

    subjects.value = data.map(item => ({
      id: item.subject_id,
      name: item.subject_name
    }))
  } catch (err) {
    ElMessage.error(err.message || 'Failed to load class subjects.')
  }
}


const getStudents = async () => {
  try {
    const { data, error } = await supabase
      .from('students')

      .select('id, full_name, class_id')
      .eq('school_id', schoolId)

    if (error) throw error
    students.value = data || []
  } catch (err) {
    ElMessage.error(err.message || 'Failed to fetch students.')
  }
}

const getScores = async () => {
  if (!selectedExamId.value) return
  try {
    loading.value = true
    await getSubjectsForStudent()
    const { data, error } = await supabase.rpc('get_exam_scores', {
      p_exam_paper_id: selectedExamId.value
    })
    if (error) throw error
    scores.value = data || []
  } catch (err) {
    ElMessage.error(err.message || 'Failed to fetch scores.')
    scores.value = []
  } finally {
    loading.value = false
  }
}

// ---- CRUD ----
const addScore = async () => {
  await supabase.rpc('add_or_update_exam_score', {
    p_exam_paper_id: selectedExamId.value,
    p_student_id: form.student_id,
    p_subject_id: form.subject_id,
    p_score: form.score,
    p_remarks: form.remarks
  })
}

const updateScore = async () => {
  await supabase.rpc('add_or_update_exam_score', {
    p_exam_paper_id: selectedExamId.value,
    p_student_id: form.student_id,
    p_subject_id: form.subject_id,
    p_score: form.score,
    p_remarks: form.remarks
  })
}

const deleteScore = async (id) => {
  await supabase.rpc('delete_exam_score', { p_id: id })
}

// ---- Actions ----
const submitForm = async () => {
  if (!(await formRef.value.validate())) return
  try {
    loading.value = true
    if (dialogMode.value === 'add') {
      await addScore()
      ElNotification.success({ title: 'Success', message: 'Score added successfully!' })
    } else {
      await updateScore()
      ElNotification.success({ title: 'Updated', message: 'Score updated successfully!' })
    }
    await getScores()
    closeDialog()
  } catch (err) {
    ElMessage.error(err.message || 'Failed to save score.')
  } finally {
    loading.value = false
  }
}

const confirmDelete = (score) => {
  scoreToDelete.value = score
  showDeleteDialog.value = true
}

const performDelete = async () => {
  try {
    loading.value = true
    await deleteScore(scoreToDelete.value.id)
    ElNotification.success({ title: 'Deleted', message: 'Score deleted successfully!' })
    await getScores()
  } catch (err) {
    ElMessage.error(err.message || 'Failed to delete score.')
  } finally {
    loading.value = false
    showDeleteDialog.value = false
  }
}

// ---- Formatters ----
const formatDate = (date) => moment(date).format('DD MMM YYYY')

// ---- Init ----
onMounted(async () => {
  await getExams()
  await getStudents()
})
</script>

<template>
  <MainLayout>
    <div class="px-4 py-2">
      <!-- Header -->
      <div class="bg-white flex rounded shadow justify-between items-center border-b p-4 mb-4">
        <div>
          <h1 class="text-xl font-bold mt-4">Exam Scoring</h1>
          <p class="text-gray-500 text-sm mt-1">Manually enter and manage students' exam scores</p>
        </div>

        <v-btn
          @click="openAddDialog"
          size="medium"
          class="normal-case custom-btn hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-md shadow-md"
        >
          <span
            class="bg-white text-blue-600 rounded-full p-1 flex items-center justify-center w-4 h-4 mr-2"
          >
            <i class="fa-solid fa-plus text-sm text-[#15803d]"></i>
          </span>
          Add New Score
        </v-btn>
      </div>

      <!-- Exam Filter -->
      <div class="bg-white p-4 rounded shadow mb-4 flex items-center gap-4">
        <v-select
          v-model="selectedExamId"
          :items="exams"
          item-title="title"
          item-value="id"
          label="Select Exam Paper"
          variant="outlined"
          color="#15803d"
          class="w-72"
          @update:modelValue="getScores"
        />
      </div>

      <!-- Scores Table -->
      <div v-if="loading" class="text-center py-10">
        <v-progress-circular indeterminate color="success" size="48" />
      </div>

      <div v-else class="overflow-x-auto bg-white rounded shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Subject
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Remarks
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="score in scores" :key="score.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ score.student_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ score.subject_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ score.score }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ score.remarks }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center flex gap-4 justify-center">
                <button @click="openEditDialog(score)" class="text-blue-500 hover:text-blue-700">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button @click="confirmDelete(score)" class="text-red-500 hover:text-red-700">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!scores.length && selectedExamId && !loading" class="p-4 text-gray-500">
          No scores added for this exam yet.
        </div>
      </div>

      <!-- Add/Edit Dialog -->
      <v-dialog v-model="showDialog" max-width="600px" persistent>
        <v-card>
          <v-card-title class="text-lg font-bold">
            {{ dialogMode === 'add' ? 'Add Score' : 'Edit Score' }}
          </v-card-title>

          <v-card-text>
            <v-form ref="formRef" v-model="isValid">
              <v-select
                variant="outlined"
                color="#15803d"
                v-model="form.student_id"
                :items="students"
                item-title="full_name"
                item-value="id"
                label="Select Student"
                :rules="[(v) => !!v || 'Student is required']"
                required
                  @update:modelValue="getSubjectsForStudent"
              />

              <v-select
                class="mt-4"
                variant="outlined"
                color="#15803d"
                v-model="form.subject_id"
                :items="subjects"
                item-title="name"
                item-value="id"
                label="Select Subject"
                :rules="[(v) => !!v || 'Subject is required']"
                required
              />

              <v-text-field
                class="mt-4"
                variant="outlined"
                color="#15803d"
                v-model="form.score"
                label="Score"
                type="number"
                :rules="[(v) => (v !== '' && v >= 0) || 'Enter a valid score']"
                required
              />

              <v-textarea
                class="mt-4"
                variant="outlined"
                color="#15803d"
                v-model="form.remarks"
                label="Remarks"
                auto-grow
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
            Are you sure you want to delete this score for
            <strong>{{ scoreToDelete?.student_name }}</strong
            >?
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn text @click="showDeleteDialog = false">Cancel</v-btn>
            <v-btn color="red" class="text-white" @click="performDelete">Delete</v-btn>
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
