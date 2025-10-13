<template>
  <MainLayout>
    <div class="p-6 space-y-6">
      <h1 class="text-2xl font-bold mb-4">Create Exam / Test</h1>

      <!-- Exam Meta -->
      <v-card class="pa-4 space-y-4">
        <v-text-field v-model="exam.title" label="Exam Title" variant="outlined"
              color="#15803d"/>
        <v-select v-model="exam.exam_type" :items="examTypes" label="Exam Type" variant="outlined"
              color="#15803d"/>
        <v-select v-model="exam.class_id" :items="classes" label="Class" variant="outlined"
              color="#15803d"/>
        <v-select v-model="exam.subject" :items="subjects" label="Subject" variant="outlined"
              color="#15803d"/>
        <v-textarea v-model="exam.instructions" label="Instructions" variant="outlined"
              color="#15803d"/>
        <v-text-field v-model="exam.duration" label="Duration (minutes)" type="number" variant="outlined"
              color="#15803d"/>
      </v-card>

      <!-- Questions Section -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-xl font-semibold">Questions</h2>
          <v-btn color="primary" @click="addQuestion">+ Add Question</v-btn>
        </div>

        <div v-for="(q, index) in questions" :key="q.id" class="border rounded-lg p-4 mb-4 bg-white shadow-sm">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold">Question {{ index + 1 }}</h3>
            <v-btn icon="mdi-delete" size="small" color="red" variant="text" @click="removeQuestion(index)" />
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
          <QuillEditor v-model:content="q.question" theme="snow" content-type="delta" class="bg-white mb-4 rounded shadow p-2" />

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
              <v-btn icon="mdi-delete" size="x-small" variant="text" color="red" @click="removeOption(q, i)" />
            </div>
            <v-btn variant="tonal" color="primary" size="small" @click="addOption(q)">+ Add Option</v-btn>

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
            <QuillEditor v-model:content="q.answer" theme="snow" content-type="delta" class="bg-white rounded shadow p-2" />
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
            <p class="font-semibold mb-2">Q{{ index + 1 }}. 
              <QuillEditor v-model:content="q.question" read-only theme="bubble" content-type="delta" />
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
import { ref, reactive } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { supabase } from '@/supabase'

/* ----------------------------------------------------------
   DATA: Static lists (you can later fetch dynamically)
---------------------------------------------------------- */
const examTypes = ['Test', 'Midterm', 'Final Exam']
const questionTypes = ['objective', 'mcq', 'theory']
const classes = ['JSS1', 'JSS2', 'SS1']
const subjects = ['Mathematics', 'English', 'Biology']

/* ----------------------------------------------------------
   FORM: Exam metadata
---------------------------------------------------------- */
const exam = reactive({
  title: '',
  exam_type: '',
  class_id: '',
  subject: '',
  instructions: '',
  duration: 60,
})

/* ----------------------------------------------------------
   STATE: Questions + preview
---------------------------------------------------------- */
const questions = ref([])
const showPreview = ref(false)

/* ----------------------------------------------------------
   QUILL CONFIG: Enable all advanced features
---------------------------------------------------------- */
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false,
  },
  imageResize: true,
  syntax: true,
}

/* ----------------------------------------------------------
   HANDLERS: Question logic
---------------------------------------------------------- */
const addQuestion = () => {
  questions.value.push({
    id: uuidv4(),
    type: 'theory',
    question: '', // Quill HTML output
    options: [],
    correct_answer: '',
    marks: 10,
  })
}

const removeQuestion = (index) => {
  questions.value.splice(index, 1)
}

const addOption = (q) => {
  q.options.push('')
}

const removeOption = (q, i) => {
  q.options.splice(i, 1)
}

const previewExam = () => {
  showPreview.value = true
}

/* ----------------------------------------------------------
   SAVE: Insert exam with questions to Supabase
---------------------------------------------------------- */
const saveExam = async () => {
  try {
    // Compute total marks
    const totalMarks = questions.value.reduce(
      (sum, q) => sum + Number(q.marks || 0),
      0
    )

    // Prepare payload
    const payload = {
      id: uuidv4(),
      title: exam.title,
      exam_type: exam.exam_type,
      class_id: exam.class_id,
      subject: exam.subject,
      instructions: exam.instructions,
      duration: exam.duration,
      total_marks: totalMarks,
      content: questions.value, // JSON of all questions
      created_at: new Date(),
    }

    const { data, error } = await supabase.from('exams').insert([payload]).select()

    if (error) throw error

    alert('✅ Exam saved successfully!')
    resetForm()
  } catch (err) {
    console.error('❌ Failed to save exam:', err)
    alert('❌ Failed to save exam.')
  }
}

const resetForm = () => {
  exam.title = ''
  exam.exam_type = ''
  exam.class_id = ''
  exam.subject = ''
  exam.instructions = ''
  exam.duration = 60
  questions.value = []
  showPreview.value = false
}
</script>


<style scoped>
.v-btn{
    text-transform: none;
}
</style>