<template>
  <MainLayout>
    <div class="p-6 space-y-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-md font-bold">Create Assessments</h1>
        </div>
        <div>
          <v-btn to="/assessments" class="" variant="plain" color="primary">View assessments</v-btn>
        </div>
      </div>
      

      <!-- assessment Meta -->
      <v-card class="pa-4 space-y-4">
        <v-text-field
          v-model="assessment.title"
          label="assessment Title"
          variant="outlined"
          color="#214ec8"
        />
        <v-select
          v-model="assessment.component"
          :items="components"
          label="Assessment Type"
          variant="outlined"
          color="#214ec8"
        />
        <v-select
          v-model="assessment.class_id"
          :items="schoolClasses"
          item-title="name"
          item-value="id"
          label="Class"
          variant="outlined"
          color="#214ec8"
        />
        <v-select
          v-model="assessment.subject_id"
          :items="schoolSubjects"
          item-title="subject_name"
          item-value="school_subject_id"
          label="Subject"
          variant="outlined"
          color="#214ec8"
        />

        <v-textarea
          v-model="assessment.instructions"
          label="Instructions"
          variant="outlined"
          color="#214ec8"
        />
        <v-text-field
          v-model="assessment.duration"
          label="Duration (minutes)"
          type="number"
          variant="outlined"
          color="#214ec8"
        />

        <div class="flex flex-col sm:flex-row gap-4">
  <!-- Date Picker -->
  <v-menu v-model="showDatePicker" transition="scale-transition" offset-y>
    <template #activator="{ props }">
      <v-text-field
        v-bind="props"
        v-model="formattedDate"
        label="Assessment Date"
        variant="outlined"
        density="compact"
        color="#214ec8"
        prepend-inner-icon="mdi-calendar"
        readonly
      />
    </template>

    <v-date-picker
      v-model="dateOnly"
      color="#214ec8"
      elevation="4"
      show-adjacent-months
    />
  </v-menu>

  <!-- Time Picker -->
<!-- Time Picker (native input) -->
<v-text-field
  v-model="timeOnly"
  label="Assessment Time"
  type="time"
  variant="outlined"
  density="compact"
  color="#214ec8"

/>

</div>

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
            color="#214ec8"
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
                color="#214ec8"
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
              color="#214ec8"
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
            color="#214ec8"
            class="mt-3 w-32"
          />
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <v-btn variant="outlined" color="grey" @click="previewAssessment">Preview</v-btn>
        <v-btn color="success" @click="saveAssessment">Save assessment</v-btn>
      </div>

      <!-- Preview Dialog -->
      <v-dialog v-model="showPreview" max-width="800px" persistent>
        <v-card class="p-6">
          <h2 class="text-xl font-bold mb-2">{{ assessment.title }}</h2>
          <p class="text-gray-600 mb-4">{{ assessment.instructions }}</p>

          <div v-for="(q, index) in questions" :key="index" class="mb-6">
            <p class="font-semibold mb-2">Q{{ index + 1 }}.</p>
            <QuillEditor :content="q.question" read-only theme="bubble" />
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
import { ref, reactive, onMounted,watch, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import moment from 'moment'

const showDatePicker = ref(false)

const dateOnly = ref(null)
const timeOnly = ref(null)

// Formatted display values
const formattedDate = computed(() =>
  dateOnly.value ? moment(dateOnly.value).format('DD/MM/YYYY') : ''
)

// Automatically combine date + time into assessment.assessment_date
watch([dateOnly, timeOnly], ([date, time]) => {
  if (date && time) {
    const combined = moment(
      `${moment(date).format('YYYY-MM-DD')} ${time}`,
      'YYYY-MM-DD HH:mm'
    ).toISOString()
    assessment.assessment_date = combined
  }
})
const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id

const components = ref([])
const fetchComponents = async () => {
  const { data, error } = await supabase.from('assessment_types').select('name')
  if (!error) components.value = data.map((t) => t.name)
}

const questionTypes = ['objective', 'mcq', 'theory']
const schoolClasses = ref([])
const schoolSubjects = ref([])
const questions = ref([])
const showPreview = ref(false)

const assessment = reactive({
  title: '',
  component: '',
  class_id: '',
  subject_id: '',
  instructions: '',
  duration: 60,
  assessment_date: ''
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
    console.log('school subjects:', data)
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
const previewAssessment = () => (showPreview.value = true)

/* ───────────── Save assessment ───────────── */
const saveAssessment = async () => {
  try {
    const payload = {
      p_school_id: schoolId,
      p_class_id: assessment.class_id || null,
      p_subject_id: assessment.subject_id || null,
      p_title: assessment.title?.trim() || null,
      p_component: assessment.component || null,
      p_instructions: assessment.instructions || null,
      p_duration: Number(assessment.duration) || 0,
      p_assessment_date: assessment.assessment_date,
      p_questions: questions.value.map((q) => ({
        question_type: q.type,
        question_content: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        max_score: Number(q.marks || 0),
        answer: q.answer
      }))
    }
    console.log('assessment payload:', payload)
    const { data, error } = await supabase.rpc('sp_create_assessment_with_questions', payload)
    if (error) throw error

    ElMessage.success('✅ Assessment created successfully!')
    resetForm()
  } catch (err) {
    console.error('❌ Failed to save assessment:', err)
    ElMessage.error(`Failed to save: ${err.message || err}`)
  }
}

const editorToolbar = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ header: [1, 2, 3, false] }],
  [{ align: [] }],
  ['clean'] // remove formatting
]

// const loadAssessment = async (id) => {
//   const { data, error } = await supabase.rpc('sp_get_assessment', { p_assessment_id: id });
//   if (!error) {
//     assessment.value = data.assessment;
//     questions.value = data.questions || [];
//   }
// };

/* ───────────── Helpers ───────────── */
const resetForm = () => {
  Object.assign(assessment, {
    title: '',
    component: '',
    class_id: '',
    subject_id: '',
    instructions: '',
    duration: 60,
    assessment_date: ''
  })
  questions.value = []
  showPreview.value = false
}

/* ───────────── Lifecycle ───────────── */
onMounted(() => {
  fetchComponents()
  fetchClasses()
  fetchSchoolSubjects()
})
</script>

<style scoped>
.v-btn {
  text-transform: none;
}
</style>
