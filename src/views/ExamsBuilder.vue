<template>
  <MainLayout>
    <div class="p-6 space-y-6">
      <h1 class="text-2xl font-bold mb-4">Create Exam / Test</h1>

      <!-- Exam Meta -->
      <v-card class="pa-4 space-y-4">
        <v-text-field v-model="exam.title" label="Exam Title" variant="outlined" color="#15803d" />
        <v-select
          v-model="exam.component"
          :items="components"
          label="Assessment Type"
          variant="outlined"
          color="#15803d"
        />
        <v-select
          v-model="exam.class_id"
          :items="schoolClasses"
          item-title="name"
          item-value="id"
          label="Class"
          variant="outlined"
          color="#15803d"
        />
        <v-select
  v-model="exam.subject_id"
  :items="schoolSubjects"
  item-title="subject_name"
  item-value="school_subject_id"
  label="Subject"
  variant="outlined"
  color="#15803d"
/>

        <v-textarea
          v-model="exam.instructions"
          label="Instructions"
          variant="outlined"
          color="#15803d"
        />
        <v-text-field
          v-model="exam.duration"
          label="Duration (minutes)"
          type="number"
          variant="outlined"
          color="#15803d"
        />
      </v-card>

      <!-- Questions Section -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-xl font-semibold">Questions</h2>
          <v-btn color="primary" @click="addQuestion">+ Add Question</v-btn>
        </div>

        <div
          v-for="(q, index) in questions"
          :key="q.id"
          class="border rounded-lg p-4 mb-4 bg-white shadow-sm"
        >
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold">Question {{ index + 1 }}</h3>
            <v-btn
              icon="mdi-delete"
              size="small"
              color="red"
              variant="text"
              @click="removeQuestion(index)"
            />
          </div>

          <v-select
            v-model="q.type"
            :items="questionTypes"
            label="Question Type"
            density="compact"
            hide-details
            class="mb-3"
            variant="outlined"
            color="#15803d"
          />

          <label class="font-medium text-sm mb-1">Question Text</label>
          <QuillEditor
            :toolbar="editorToolbar"
            v-model:content="q.question"
            theme="snow"
            class="bg-white mb-4 rounded shadow p-2"
          />

          <div v-if="q.type === 'mcq' || q.type === 'objective'">
            <h4 class="font-medium mb-2">Options</h4>
            <div v-for="(opt, i) in q.options" :key="i" class="flex items-center mb-2 gap-2">
              <v-text-field
                v-model="q.options[i]"
                label="Option"
                density="compact"
                hide-details
                class="flex-1"
                variant="outlined"
                color="#15803d"
              />
              <v-btn
                icon="mdi-delete"
                size="x-small"
                variant="text"
                color="red"
                @click="removeOption(q, i)"
              />
            </div>
            <v-btn variant="tonal" color="primary" size="small" @click="addOption(q)"
              >+ Add Option</v-btn
            >

            <v-select
              v-model="q.correct_answer"
              :items="q.options"
              label="Correct Answer"
              class="mt-3"
              density="compact"
              variant="outlined"
              color="#15803d"
            />
          </div>

          <div v-if="q.type === 'theory'" class="mt-4">
            <label class="font-medium text-sm mb-1">Suggested Answer (optional)</label>
            <QuillEditor
              :toolbar="editorToolbar"
              v-model:content="q.answer"
              theme="snow"
              class="bg-white rounded shadow p-2"
            />
          </div>

          <v-text-field
            v-model="q.marks"
            label="Marks"
            type="number"
            density="compact"
            variant="outlined"
            color="#15803d"
            class="mt-3 w-32"
          />
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <v-btn variant="outlined" color="grey" @click="previewExam">Preview</v-btn>
        <v-btn color="success" @click="saveExam">Save Exam</v-btn>
      </div>

      <!-- Preview Dialog -->
      <v-dialog v-model="showPreview" max-width="800px">
        <v-card class="p-6">
          <h2 class="text-xl font-bold mb-2">{{ exam.title }}</h2>
          <p class="text-gray-600 mb-4">{{ exam.instructions }}</p>
          <div v-for="(q, index) in questions" :key="index" class="mb-6">
            <p class="font-semibold mb-2">
              Q{{ index + 1 }}.
              <QuillEditor
                :toolbar="editorToolbar"
                v-model:content="q.question"
                read-only
                theme="bubble"
              />
            </p>
            <div v-if="q.type !== 'theory'">
              <ul class="list-disc pl-6">
                <li v-for="(opt, i) in q.options" :key="i">{{ opt }}</li>
              </ul>
              <p class="mt-2 text-sm text-green-700">Correct: {{ q.correct_answer }}</p>
            </div>
          </div>
        </v-card>
      </v-dialog>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, reactive, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id

const components = ['Test', 'Exam', 'Assignment', 'Project', 'Quiz', 'Other']
const questionTypes = ['objective', 'mcq', 'theory']
const schoolClasses = ref([])
const schoolSubjects = ref([])
const questions = ref([])
const showPreview = ref(false)

const exam = reactive({
  title: '',
  component: '',
  class_id: '',
  subject_id: '',
  instructions: '',
  duration: 60,
  exam_date: ''
})

/* ───────────── Fetch helpers ───────────── */
const fetchClasses = async () => {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name')
    .eq('school_id', schoolId)
  if (!error) schoolClasses.value = data
}

const fetchSchoolSubjects = async () => {
  try {
    const { data, error } = await supabase.rpc('sp_get_school_subjects', { p_school_id: schoolId })
    if (error) throw error
    schoolSubjects.value = data
    console.log("school subjects:", data)
  } catch (err) {
    console.error('Error fetching subjects:', err)
  }
}

/* ───────────── Question Handlers ───────────── */
const addQuestion = () => {
  questions.value.push({
    id: uuidv4(),
    type: 'theory',
    question: '',
    options: [],
    correct_answer: '',
    marks: 10,
    answer: ''
  })
}

const removeQuestion = (index) => questions.value.splice(index, 1)
const addOption = (q) => q.options.push('')
const removeOption = (q, i) => q.options.splice(i, 1)
const previewExam = () => (showPreview.value = true)

/* ───────────── Save Exam ───────────── */
const saveExam = async () => {
  const debug = true
  try {
    console.log('🟢 Starting saveExam()')
    const totalMarks = questions.value.reduce((sum, q) => sum + Number(q.marks || 0), 0)

    const paperPayload = {
      school_id: schoolId,
      class_id: exam.class_id || null,
      subject_id: exam.subject_id || null,
      title: exam.title?.trim() || null,
      component: exam.component || null,
      instructions: exam.instructions || null,
      duration: exam.duration || null,
      total_marks: totalMarks,
      exam_date: new Date()
    }

    if (debug) console.log('📝 Paper Payload:', paperPayload)
    const { data: paper, error: paperError } = await supabase
      .from('exam_papers')
      .insert([paperPayload])
      .select()
      .single()

    if (debug) console.log('📄 Paper Response:', paper, 'Error:', paperError)
    if (paperError) throw paperError

    const formattedQuestions = questions.value.map((q, i) => ({
      exam_paper_id: paper.id,
      question_number: i + 1,
      question_content: q.question || '',
      question_type: q.type || 'theory',
      options: q.options?.length ? q.options : null,
      correct_answer: q.correct_answer || null,
      marks: Number(q.marks || 0),
      answer: q.answer || null
    }))

    if (debug) console.log('🧩 Questions Payload:', formattedQuestions)
    const { data: questionData, error: qError } = await supabase
      .from('exam_questions')
      .insert(formattedQuestions)
      .select()

    if (debug) console.log('📦 Question Response:', questionData, 'Error:', qError)
    if (qError) throw qError

    ElMessage.success('✅ Exam and questions saved successfully!')
    resetForm()
  } catch (err) {
    console.error('❌ Failed to save exam:', err)
    ElMessage.error(`Failed to save exam: ${err.message || err}`)
  }
}

const editorToolbar = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ header: [1, 2, 3, false] }],
  [{ align: [] }],
  ['clean']                                         // remove formatting
]

/* ───────────── Helpers ───────────── */
const resetForm = () => {
  Object.assign(exam, {
    title: '',
    component: '',
    class_id: '',
    subject_id: '',
    instructions: '',
    duration: 60,
    exam_date: ''
  })
  questions.value = []
  showPreview.value = false
}

/* ───────────── Lifecycle ───────────── */
onMounted(() => {
  fetchClasses()
  fetchSchoolSubjects()
})
</script>

<style scoped>
.v-btn {
  text-transform: none;
}
</style>
