<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import api from '@/services/api'
import { ElMessage } from 'element-plus'
const loading = ref(true)
import { supabase } from '@/supabase'
const showModal = ref(false)
const activeTab = ref('students')
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const schoolId = authStore.admin?.school_id
// Validation refs
const studentFormRef = ref(null)
const teacherFormRef = ref(null)
const employeeFormRef = ref(null)
const studentFormValid = ref(false)
const teacherFormValid = ref(false)
const employeeFormValid = ref(false)

const schoolSubjects = ref([]) // subjects list
const schoolClasses = ref([])

const subjectFormRef = ref(null)
const schoolSubjectFormValid = ref(false)

const subjectsCatalogue = ref([])

const fetchSubjectsCatalogue = async () => {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    ElMessage.error(`Error fetching subjects: ${error.message}`)
  } else {
    subjectsCatalogue.value = data
  }
}

const subjectData = ref({
  subject_id: null,
  custom_name: '',
  custom_code: ''
})

// Submit new school subject
const submitSchoolSubject = async () => {
  if (!schoolSubjectFormValid.value) return

  const { error } = await supabase.rpc('sp_add_school_subject', {
    p_school_id: schoolId,
    p_subject_id: subjectData.value.subject_id,
    p_custom_name: subjectData.value.custom_name,
    p_custom_code: subjectData.value.custom_code
  })

  if (error) {
    ElMessage.error(`Error adding subject: ${error.message}`)
    console.log('error adding subjects:', error)
  } else {
    closeModal()
    ElMessage.success('Subject added successfully!')
    subjectFormRef.value.reset()
    // Optionally refresh the school subjects list
    fetchSchoolSubjects()
  }
}

// Fetch all subjects for the school via RPC
// ======================
const fetchSchoolSubjects = async () => {
  try {
    const { data, error } = await supabase.rpc('sp_get_school_subjects', { p_school_id: schoolId }) // replace with your param name
    if (error) throw error
    schoolSubjects.value = data
    console.log('school subjects:', schoolSubjects.value)
  } catch (err) {
    console.log('Error fetching subjects:', err)
  }
}

const classFormRef = ref(null)
const classFormValid = ref(false)

const classData = ref({
  name: '',
  level: ''
})

// Submit new class
const submitClass = async () => {
  if (!classFormValid.value) return

  // 👀 Log what you're sending
  console.log('Submitting class payload:', {
    p_name: classData.value.name,
    p_level: classData.value.level,
    p_school_id: schoolId
  })

  const { data, error } = await supabase.rpc('sp_add_class', {
    p_name: classData.value.name,
    p_level: classData.value.level,
    p_school_id: schoolId
  })
  console.log('add class data:', data)
  if (error) {
    ElMessage.error(`Error adding class: ${error.message}`)
  } else {
    closeModal()
    ElMessage.success('Class added successfully!')
    classFormRef.value.reset()
  }
}

// ======================
// Fetch all classes for the school via RPC
// ======================
const fetchSchoolClasses = async () => {
  try {
    const { data, error } = await supabase.rpc('sp_get_classes', { p_school_id: schoolId }) // replace with your param name
    if (error) throw error
    schoolClasses.value = data
    console.log('school classes:', schoolClasses.value)
  } catch (err) {
    console.error('Error fetching classes:', err)
  }
}

// Student fields (matches `students` table)
const studentData = ref({
  full_name: '',
  email: '',
  phone: '',
  gender: '',
  date_of_birth: '',
  address: '',
  guardian_name: '',
  guardian_contact: '',
  class_id: '',
  avatar_url: null // file
})

const avatarPreview = ref(null)

const previewAvatar = (files) => {
  if (!files) {
    avatarPreview.value = null
    return
  }

  const file = Array.isArray(files) ? files[0] : files
  avatarPreview.value = file instanceof File ? URL.createObjectURL(file) : null
}

const computedAvatarPreview = computed(() => {
  const file = Array.isArray(studentData.value.avatar_url)
    ? studentData.value.avatar_url[0]
    : studentData.value.avatar_url

  return file instanceof File ? URL.createObjectURL(file) : null
})
const showPreviewModal = ref(false)

const handlePreview = async () => {
  const { valid } = await studentFormRef.value.validate()
  if (!valid) return

  // Ensure DOB is in displayable format for preview
  if (studentData.value.date_of_birth instanceof Date) {
    studentData.value.date_of_birth = studentData.value.date_of_birth.toISOString().split('T')[0]
  }

  showPreviewModal.value = true
}

const submitStudent = async () => {
  const { valid } = await studentFormRef.value.validate()
  if (!valid) return

  try {
    // 1️⃣ Format date_of_birth to YYYY-MM-DD
    if (studentData.value.date_of_birth) {
      const dob = new Date(studentData.value.date_of_birth)
      studentData.value.date_of_birth = dob.toISOString().split('T')[0]
    }

    // 2️⃣ Log payload before sending
    const payload = {
      school_id: schoolId,
      full_name: studentData.value.full_name,
      email: studentData.value.email,
      phone: studentData.value.phone,
      gender: studentData.value.gender,
      date_of_birth: studentData.value.date_of_birth,
      address: studentData.value.address,
      guardian_name: studentData.value.guardian_name,
      guardian_contact: studentData.value.guardian_contact,
      class_id: studentData.value.class_id,
      avatar_url: null // Skipping upload for now
    }

    console.log('📦 Payload to insert:', payload)

    // 3️⃣ Show uploading message
    ElMessage({
      message: 'Saving student...',
      type: 'info',
      duration: 1500
    })

    // 4️⃣ Insert into database
    const { data, error } = await supabase.from('students').insert([payload]).select()

    if (error) throw error

    ElMessage({
      message: 'Student saved successfully!',
      type: 'success',
      duration: 2000
    })

    console.log('Student saved:', data)
    closeModal()
  } catch (err) {
    console.error('❌ Error saving student:', err.message)
    ElMessage.error('Failed to save student. Please try again.')
  }
}

const confirmSave = async () => {
  try {
    const payload = {
      school_id: schoolId,
      full_name: studentData.value.full_name,
      email: studentData.value.email,
      phone: studentData.value.phone,
      gender: studentData.value.gender,
      date_of_birth: studentData.value.date_of_birth,
      address: studentData.value.address,
      guardian_name: studentData.value.guardian_name,
      guardian_contact: studentData.value.guardian_contact,
      class_id: studentData.value.class_id,
      avatar_url: null
    }

    console.log('📦 Final payload:', payload)

    ElMessage({
      message: 'Saving student...',
      type: 'info',
      duration: 1500
    })

    const { data, error } = await supabase.from('students').insert([payload]).select()
    if (error) throw error
    resetFormAndClose()
    fetchAll()
    ElMessage.success('Student saved successfully!')
    console.log('Student saved:', data)

    showPreviewModal.value = false
    closeModal()
  } catch (err) {
    console.error('❌ Error saving student:', err.message)
    ElMessage.error('Failed to save student. Please try again.')
  }
}

// Teacher fields (matches `teachers` table)
const teacherData = ref({
  full_name: '',
  email: '',
  phone: '',
  gender: '',
  date_of_birth: null,
  address: '',
  avatar_url: null, // ✅ should be null instead of ''
  subject_specializations: [], // multiple subjects
  main_class_id: null,
  other_class_ids: [] // multiple classes
})

const teacherAvatarPreview = ref(null)

const previewTeacherAvatar = (files) => {
  if (!files) {
    teacherAvatarPreview.value = null
    return
  }

  const file = Array.isArray(files) ? files[0] : files
  teacherAvatarPreview.value = file instanceof File ? URL.createObjectURL(file) : null
}

const computedTeacherAvatarPreview = computed(() => {
  const file = Array.isArray(teacherData.value.avatar_url)
    ? teacherData.value.avatar_url[0]
    : teacherData.value.avatar_url

  return file instanceof File ? URL.createObjectURL(file) : null
})

const showTeacherPreviewModal = ref(false)

const handleTeacherPreview = async () => {
  const { valid } = await teacherFormRef.value.validate()
  if (!valid) return

  if (teacherData.value.date_of_birth instanceof Date) {
    teacherData.value.date_of_birth = teacherData.value.date_of_birth.toISOString().split('T')[0]
  }

  showTeacherPreviewModal.value = true
}

const confirmSaveTeacher = async () => {
   showTeacherPreviewModal.value = false
  try {
    const payload = {
      p_school_id: schoolId,
      p_full_name: teacherData.value.full_name,
      p_email: teacherData.value.email,
      p_phone: teacherData.value.phone,
      p_gender: teacherData.value.gender,
      p_address: teacherData.value.address,
      p_date_of_birth: teacherData.value.date_of_birth,
      p_avatar_url: null,
      p_subject_ids: teacherData.value.subject_specializations || [],
      p_main_class_id: teacherData.value.main_class_id || null,
      p_other_class_ids: teacherData.value.other_class_ids || []
    }

    closeModal()
    console.log('📦 Teacher payload:', payload)

    ElMessage({
      message: 'Saving Teacher',
      type: 'info',
      duration: 2000,
      offset: 20, // distance from top
      customClass: 'el-message-top-left'
    })

    // 🔥 Call your stored procedure instead of insert
    const { data, error } = await supabase.rpc('sp_add_teacher_with_subjects', payload)
    if (error) throw error

    ElMessage({
      message: 'Teacher saved successfully!',
      type: 'success',
      duration: 2000,
      offset: 20, // distance from top
      customClass: 'el-message-top-left'
    })

    console.log('Teacher saved:', data)

    showTeacherPreviewModal.value = false
    resetTeacherForm()
  } catch (err) {
    console.error('❌ Error saving teacher:', err.message)
    ElMessage.error('Failed to save teacher. Please try again.')
  }
}

const employeeData = ref({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  gender: '',
  address: '',
  department: '',
  position: '',
  salary: ''
})

const employeeAvatarPreview = ref(null)

const previewEmployeeAvatar = (file) => {
  if (!file) {
    employeeAvatarPreview.value = null
    return
  }
  employeeAvatarPreview.value = URL.createObjectURL(file)
}

const onDateSelected = (val) => {
  employeeData.value.date_of_birth = val // already 'YYYY-MM-DD'
  dobText.value = val
}

// Student DOB
const studentDobMenu = ref(false)
const studentDobText = ref('')
watch(
  () => studentData.value.date_of_birth,
  (val) => {
    if (val) studentDobText.value = val // already 'YYYY-MM-DD'
  }
)
const onStudentDateSelected = (val) => {
  studentData.value.date_of_birth = val
  studentDobText.value = val
}

// Teacher DOB
const teacherDobMenu = ref(false)
const teacherDobText = ref('')
watch(
  () => teacherData.value.date_of_birth,
  (val) => {
    if (val) teacherDobText.value = val
  }
)
const onTeacherDateSelected = (val) => {
  teacherData.value.date_of_birth = val
  teacherDobText.value = val
}

// Employee DOB
const employeeDobMenu = ref(false)
const employeeDobText = ref('')
watch(
  () => employeeData.value.date_of_birth,
  (val) => {
    if (val) employeeDobText.value = val
  }
)
const onEmployeeDateSelected = (val) => {
  employeeData.value.date_of_birth = val
  employeeDobText.value = val
}

// Mock options (replace with API calls)
const genderOptions = ['Male', 'Female', 'Other']

// Functions
const openModal = () => (showModal.value = true)
const closeModal = () => (showModal.value = false)

const submitTeacher = () => {
  teacherFormRef.value.validate().then((success) => {
    if (success.valid) {
      console.log('Teacher data:', employeeData.value)
      // send to Supabase
      closeModal()
    }
  })
}

const submitEmployee = () => {
  employeeFormRef.value.validate().then((success) => {
    if (success.valid) {
      console.log('Teacher data:', teacherData.value)
      // send to Supabase
      closeModal()
    }
  })
}
const data = ref({
  students: [],
  teachers: [],
  employees: []
})
const loadingTabs = ref({})

const fetchData = async (endpoint, key) => {
  try {
    loadingTabs.value[key] = true
    const response = await api.get(`/${endpoint}`)
    data.value[key] = response.data.data
    console.log(key, response)

    // Set default selected if none exists
    if (!selectedItems.value[key] && response.data.data.length > 0) {
      selectedItems.value[key] = response.data.data[0]
    }
    return response.data.data
  } catch (err) {
    console.error(`Error fetching ${key || endpoint}:`, err)
    return []
  } finally {
    loadingTabs.value[key] = false
  }
}

const selectedItems = ref({})
const selectedItem = computed({
  get() {
    return selectedItems.value[tab.value] || null
  },
  set(val) {
    selectedItems.value[tab.value] = val
  }
})

const selectItem = (item) => {
  selectedItem.value = item
}
const classMap = {
  '54c2929a-de11-4829-87ab-5ccd2fdf8998': 'JSS1',
  '2ab9da37-18d7-4b21-b089-c907c9fee25b': 'JSS2',
  '7b614ee8-5f72-427b-bd78-eeef84d2347a': 'JSS3',
  'e2679e5e-5fe9-44c1-bf2b-4b6aa0f82425': 'SSS1',
  '608b08db-906d-4f11-86dc-09c6a0d13ff5': 'SSS2',
  'b316c14c-8877-42b5-b0c6-c4370cc6e3a3': 'SSS3'
}

// Convert classMap into an array suitable for v-select
const classOptions = Object.entries(classMap).map(([key, value]) => ({
  title: value,
  value: key
}))

const mapClassIdToName = (classId) => {
  return classMap[classId] || 'Unknown'
}

const loadStudents = async () => {
  const students = await fetchData('students', 'students') // Now sets and logs correctly

  const mappedStudents = students.map((s) => ({
    ...s,
    class_name: mapClassIdToName(s.class_id),
    marks_percent: s.marks_percent || Math.floor(Math.random() * 100),
    rank: s.rank || '-'
  }))

  // Sort by marks_percent in descending order
  mappedStudents.sort((a, b) => b.marks_percent - a.marks_percent)

  data.value.students = mappedStudents
}

const fetchAll = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchData('teachers', 'teachers'),
      loadStudents(),
      fetchSubjectsCatalogue(),
      fetchSchoolClasses(),
      fetchSchoolSubjects(),
      fetchData('employees', 'employees')
    ])
    // Set default selected item for 'students' if data exists
    if (data.value.students.length && tab.value === 'students') {
      selectedItem.value = data.value.students[0]
    }
  } catch (err) {
    console.log('❌ Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

const tab = ref('students')

const tabs = [
  { label: 'Students', value: 'students' },
  { label: 'Teachers', value: 'teachers' },
  { label: 'Employees', value: 'employees' },
  { label: 'Subjects', value: 'subjects' },
  { label: 'Classes', value: 'classes' }
]

const resetFormAndClose = () => {
  studentFormRef.value.reset() // Clears all inputs
  studentData.value = {
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    address: '',
    guardian_name: '',
    guardian_contact: '',
    class_id: '',
    avatar_url: null
  }
  avatarPreview.value = null
  closeModal()
}

onMounted(fetchAll)
watch(tab, (newTab) => {
  if (!selectedItems.value[newTab]) {
    const items = data.value[newTab]
    if (items && items.length > 0) {
      selectedItems.value[newTab] = items[0]
    }
  }
})
</script>

<template>
  <MainLayout>
    <div class="px-6 py-4">
      <!-- Header with Title and New credit search Button -->
      <div class="bg-white flex rounded shadow justify-between items-center border-b p-4 mb-4">
        <div class="mb-2">
          <h1 class="text-xl font-bold mt-4">Database</h1>
          <p class="text-gray-500 text-sm mt-1">View and Manage your database records</p>
        </div>

        <v-btn
          @click="openModal"
          size="medium"
          class="normal-case custom-btn hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-md shadow-md"
        >
          <span
            class="bg-white text-blue-600 rounded-full p-1 flex items-center justify-center w-4 h-4 mr-2"
          >
            <i class="fa-solid fa-plus text-sm text-[#15803d]"></i>
          </span>
          Add new record
        </v-btn>
      </div>

      <!-- Tabs -->
      <v-tabs v-model="tab" density="compact">
        <v-tab
          :disabled="loading"
          v-for="item in tabs"
          :key="item.value"
          :value="item.value"
          class="border-b-4 border-green-700"
          slider-size="8"
          :class="{
            'text-black font-semibold': tab === item.value,
            'text-gray-500': tab !== item.value
          }"
        >
          {{ item.label }}
        </v-tab>
      </v-tabs>

      <!-- Loading -->
      <div
        v-if="loading"
        class="fill-height d-flex justify-center align-center mx-auto items-center flex my-auto mx-auto"
      >
        <v-progress-circular indeterminate color="success" size="48" />
      </div>

      <!-- database data -->
      <div v-else>
        <v-tabs-window v-model="tab" class="mt-4">
          <v-tabs-window-item value="students">
            <!-- Content Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <!-- Table -->
              <div class="col-span-2 space-y-6">
                <v-table
                  v-if="tab === 'students'"
                  height="600"
                  fixed-header
                  class="rounded-lg border"
                >
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">Class</th>
                      <th class="text-left">Gender</th>
                      <th class="text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="student in data.students"
                      :key="student.id"
                      @click="selectItem(student)"
                      class="cursor-pointer hover:bg-green-100"
                      :class="{ 'bg-green-200': selectedItem?.id === student.id }"
                    >
                      <td class="py-2 px-3 flex items-center gap-2">
                        <img
                          :src="
                            student.avatar_url ||
                            'https://ui-avatars.com/api/?name=' + student.full_name
                          "
                          class="w-8 h-8 rounded-full"
                        />
                        {{ student.full_name }}
                      </td>
                      <td>{{ student.class_name }}</td>
                      <td>{{ student.gender }}</td>
                      <td>{{ student.email }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <!-- Profile Panel -->
              <Transition name="fade" mode="out-in">
                <div
                  v-if="!loadingTabs[tab] && selectedItem"
                  :key="tab"
                  class="bg-white rounded-lg shadow-md p-6 text-sm text-gray-700"
                >
                  <!-- ID -->
                  <div class="text-center text-xs text-gray-400 font-medium mb-2">
                    {{ selectedItem.id.slice(0, 8).toUpperCase() }}
                  </div>

                  <!-- Profile Picture -->
                  <div class="flex justify-center">
                    <img
                      :src="
                        selectedItem.avatar_url ||
                        `https://ui-avatars.com/api/?name=${selectedItem.full_name}`
                      "
                      alt="avatar"
                      class="w-48 h-48 rounded-full object-cover mb-3"
                    />
                  </div>

                  <!-- Name + Role -->
                  <div class="text-center">
                    <h3 class="text-lg font-bold">{{ selectedItem.full_name }}</h3>
                    <p class="text-sm text-gray-500">
                      {{ selectedItem.class_name }}
                    </p>
                  </div>

                  <!-- Action Icons -->
                  <div class="flex justify-center gap-6 mt-4 text-gray-500 text-xl">
                    <i class="mdi mdi-message-outline"></i>
                    <i class="mdi mdi-phone-outline"></i>
                    <i class="mdi mdi-email-outline"></i>
                  </div>

                  <!-- About -->
                  <!-- <div class="mt-6">
                <h4 class="text-sm font-semibold mb-1">About</h4>
                <p class="text-xs text-gray-600 leading-relaxed">
                  Science is everywhere. A student rides to school on a bus, and in that instance
                  alone, there are many examples of technology.
                </p>
              </div> -->

                  <!-- Key Info Grid -->
                  <div class="mt-6 grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span class="font-semibold">Age:</span>
                      <span>{{
                        new Date().getFullYear() -
                        new Date(selectedItem.date_of_birth).getFullYear()
                      }}</span>
                    </div>
                    <div>
                      <span class="font-semibold">Gender:</span>
                      <span>{{ selectedItem.gender }}</span>
                    </div>
                    <div>
                      <span class="font-semibold">Date of birth:</span>
                      <span>{{
                        new Date(selectedItem.date_of_birth).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      }}</span>
                    </div>
                    <div>
                      <span class="font-semibold">Address:</span>
                      <span>{{ selectedItem.address }}</span>
                    </div>
                  </div>

                  <!-- Same Class Members -->
                  <div class="mt-6">
                    <h4 class="text-sm font-semibold mb-2">People from the same class</h4>
                    <div class="flex -space-x-3">
                      <template :key="n" v-for="n in 5">
                        <img
                          :src="`https://ui-avatars.com/api/?name=User${n}`"
                          class="w-8 h-8 rounded-full border-2 border-white"
                        />
                      </template>
                      <div
                        class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium border-2 border-white"
                      >
                        +12 more
                      </div>
                    </div>
                  </div>

                  <!-- Related Document Placeholder -->
                  <div class="mt-6">
                    <h4 class="text-sm font-semibold mb-2">Related document</h4>
                    <div class="bg-gray-100 rounded p-2 text-xs text-gray-500">
                      No documents available.
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="teachers">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <!-- Table -->
              <div class="col-span-2 space-y-6">
                <v-table
                  v-if="tab === 'teachers'"
                  height="600"
                  fixed-header
                  class="rounded-lg border"
                >
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">Gender</th>
                      <th class="text-left">Email</th>
                      <th class="text-left">Phone number</th>
                      <th class="text-left">Subject Specialization</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="teacher in data.teachers"
                      :key="teacher.id"
                      @click="selectItem(teacher)"
                      class="cursor-pointer hover:bg-green-100"
                      :class="{ 'bg-green-200': selectedItem?.id === teacher.id }"
                    >
                      <td class="py-2 px-3 flex items-center gap-2">
                        <img
                          :src="
                            teacher.avatar_url ||
                            'https://ui-avatars.com/api/?name=' + teacher.full_name
                          "
                          class="w-8 h-8 rounded-full"
                        />
                        {{ teacher.full_name }}
                      </td>

                      <td>{{ teacher.gender }}</td>
                      <td>{{ teacher.email }}</td>
                      <td>{{ teacher.phone }}</td>
                      <td>{{ teacher.subject_specialization }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <!-- Profile Panel -->
              <Transition name="fade" mode="out-in">
                <div
                  v-if="!loadingTabs[tab] && selectedItem"
                  :key="tab"
                  class="bg-white rounded-lg shadow-md p-6 text-sm text-gray-700"
                >
                  <!-- ID -->
                  <div class="text-center text-xs text-gray-400 font-medium mb-2">
                    {{ selectedItem.id.slice(0, 8).toUpperCase() }}
                  </div>

                  <!-- Profile Picture -->
                  <div class="flex justify-center">
                    <img
                      :src="
                        selectedItem.avatar_url ||
                        `https://ui-avatars.com/api/?name=${selectedItem.full_name}`
                      "
                      alt="avatar"
                      class="w-48 h-48 rounded-full object-cover mb-3"
                    />
                  </div>

                  <!-- Name + Role -->
                  <div class="text-center">
                    <h3 class="text-lg font-bold">{{ selectedItem.full_name }}</h3>
                    <p class="text-sm text-gray-500">
                      {{ selectedItem.subject_specialization }}
                    </p>
                  </div>

                  <!-- Action Icons -->
                  <div class="flex justify-center gap-6 mt-4 text-gray-500 text-xl">
                    <i class="mdi mdi-message-outline"></i>
                    <i class="mdi mdi-phone-outline"></i>
                    <i class="mdi mdi-email-outline"></i>
                  </div>

                  <!-- About -->
                  <!-- <div class="mt-6">
                <h4 class="text-sm font-semibold mb-1">About</h4>
                <p class="text-xs text-gray-600 leading-relaxed">
                  Science is everywhere. A student rides to school on a bus, and in that instance
                  alone, there are many examples of technology.
                </p>
              </div> -->

                  <!-- Key Info Grid -->
                  <div class="mt-6 grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span class="font-semibold">Age:</span>
                      <span>{{
                        new Date().getFullYear() -
                        new Date(selectedItem.date_of_birth).getFullYear()
                      }}</span>
                    </div>
                    <div>
                      <span class="font-semibold">Gender:</span>
                      <span>{{ selectedItem.gender }}</span>
                    </div>
                    <div>
                      <span class="font-semibold">Date of birth:</span>
                      <span>{{
                        new Date(selectedItem.date_of_birth).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      }}</span>
                    </div>
                    <div>
                      <span class="font-semibold">Address:</span>
                      <span>{{ selectedItem.address }}</span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="employees">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <!-- Table -->
              <div class="col-span-2 space-y-6">
                <v-table
                  v-if="tab === 'employees'"
                  height="600"
                  fixed-header
                  class="rounded-lg border"
                >
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">Gender</th>
                      <th class="text-left">Position</th>
                      <th class="text-left">Phone number</th>
                      <th class="text-left">Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="employee in data.employees"
                      :key="employee.id"
                      @click="selectItem(employee)"
                      class="cursor-pointer hover:bg-green-100"
                      :class="{ 'bg-green-200': selectedItem?.id === employee.id }"
                    >
                      <td class="py-2 px-3 flex items-center gap-2">
                        <img
                          :src="
                            employee.avatar_url ||
                            'https://ui-avatars.com/api/?name=' + employee.full_name
                          "
                          class="w-8 h-8 rounded-full"
                        />
                        {{ employee.full_name }}
                      </td>

                      <td>{{ employee.gender }}</td>
                      <td>{{ employee.position }}</td>
                      <td>{{ employee.phone }}</td>
                      <td>{{ employee.salary }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <!-- Profile Panel -->
              <Transition name="fade" mode="out-in">
                <div
                  v-if="!loadingTabs[tab] && selectedItem"
                  :key="tab"
                  class="bg-white rounded-lg shadow-md p-6 text-sm text-gray-700"
                >
                  <!-- ID -->
                  <div class="text-center text-xs text-gray-400 font-medium mb-2">
                    {{ selectedItem.id.slice(0, 8).toUpperCase() }}
                  </div>

                  <!-- Profile Picture -->
                  <div class="flex justify-center">
                    <img
                      :src="
                        selectedItem.avatar_url ||
                        `https://ui-avatars.com/api/?name=${selectedItem.full_name}`
                      "
                      alt="avatar"
                      class="w-48 h-48 rounded-full object-cover mb-3"
                    />
                  </div>

                  <!-- Name + Role -->
                  <div class="text-center">
                    <h3 class="text-lg font-bold">{{ selectedItem.full_name }}</h3>
                    <p class="text-sm text-gray-500">
                      {{ selectedItem.position }}
                    </p>
                  </div>

                  <!-- Action Icons -->
                  <div class="flex justify-center gap-6 mt-4 text-gray-500 text-xl">
                    <i class="mdi mdi-message-outline"></i>
                    <i class="mdi mdi-phone-outline"></i>
                    <i class="mdi mdi-email-outline"></i>
                  </div>

                  <!-- About -->
                  <!-- <div class="mt-6">
                <h4 class="text-sm font-semibold mb-1">About</h4>
                <p class="text-xs text-gray-600 leading-relaxed">
                  Science is everywhere. A student rides to school on a bus, and in that instance
                  alone, there are many examples of technology.
                </p>
              </div> -->

                  <!-- Key Info Grid -->
                  <div class="mt-6 grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span class="font-semibold">Age:</span>
                      <span>{{
                        new Date().getFullYear() -
                        new Date(selectedItem.date_of_birth).getFullYear()
                      }}</span>
                    </div>
                    <div>
                      <span class="font-semibold">Gender:</span>
                      <span>{{ selectedItem.gender }}</span>
                    </div>
                    <div>
                      <span class="font-semibold">Date of birth:</span>
                      <span>{{
                        new Date(selectedItem.date_of_birth).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      }}</span>
                    </div>
                    <div>
                      <span class="font-semibold">Address:</span>
                      <span>{{ selectedItem.address }}</span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </div>

    <!-- Add new record to database Modal -->
    <v-dialog v-model="showModal" persistent max-width="800px">
      <div class="w-full mx-auto p-6 bg-white shadow-lg rounded-lg relative h-screen">
        <!-- Close button -->
        <button @click="closeModal" class="absolute top-4 right-4 text-gray-600 hover:text-red-500">
          <i class="fas fa-times fa-lg"></i>
        </button>

        <!-- Tabs -->
        <div class="flex space-x-4 mb-6">
          <button
            @click="activeTab = 'students'"
            :class="
              activeTab === 'students' ? 'bg-[#15803d] text-white' : 'bg-gray-200 text-gray-700'
            "
            class="px-4 py-2 rounded transition"
          >
            Students
          </button>
          <button
            @click="activeTab = 'teachers'"
            :class="
              activeTab === 'teachers' ? 'bg-[#15803d] text-white' : 'bg-gray-200 text-gray-700'
            "
            class="px-4 py-2 rounded transition"
          >
            Teachers
          </button>

          <button
            @click="activeTab = 'employees'"
            :class="
              activeTab === 'employees' ? 'bg-[#15803d] text-white' : 'bg-gray-200 text-gray-700'
            "
            class="px-4 py-2 rounded transition"
          >
            Employees
          </button>

          <button
            @click="activeTab = 'subjects'"
            :class="
              activeTab === 'subjects' ? 'bg-[#15803d] text-white' : 'bg-gray-200 text-gray-700'
            "
            class="px-4 py-2 rounded transition"
          >
            Subjects
          </button>

          <button
            @click="activeTab = 'classes'"
            :class="
              activeTab === 'classes' ? 'bg-[#15803d] text-white' : 'bg-gray-200 text-gray-700'
            "
            class="px-4 py-2 rounded transition"
          >
            Classes
          </button>
        </div>

        <!-- Forms -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'students'" key="students">
            <h2 class="text-lg font-semibold mb-4">Add Student</h2>
            <v-form ref="studentFormRef" v-model="studentFormValid" @submit.prevent="submitStudent">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Full Name -->
                <v-text-field
                  v-model="studentData.full_name"
                  label="Full Name"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Full name is required']"
                />

                <!-- Email -->
                <v-text-field
                  v-model="studentData.email"
                  label="Email"
                  type="email"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[
                    (v) => !!v || 'Email is required',
                    (v) => /.+@.+\..+/.test(v) || 'Email must be valid'
                  ]"
                />

                <!-- Phone -->
                <v-text-field
                  v-model="studentData.phone"
                  label="Phone"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Phone is required']"
                />

                <!-- Gender -->
                <v-select
                  v-model="studentData.gender"
                  :items="genderOptions"
                  label="Gender"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Gender is required']"
                />

                <!-- Date of Birth (Vuetify date picker in a menu) -->
                <v-menu v-model="studentDobMenu" :close-on-content-click="false" max-width="290px">
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      v-model="studentDobText"
                      label="Date of Birth"
                      readonly
                      :color="'#15803d'"
                      variant="outlined"
                      :rules="[(v) => !!v || 'Date of birth is required']"
                    />
                  </template>

                  <v-date-picker
                    v-model="studentData.date_of_birth"
                    @input="onStudentDateSelected"
                    scrollable
                  >
                    <template #actions>
                      <v-btn text color="#15803d" @click="studentDobMenu = false">Cancel</v-btn>
                      <v-btn text color="#15803d" @click="studentDobMenu = false">OK</v-btn>
                    </template>
                  </v-date-picker>
                </v-menu>

                <!-- Class -->
                <v-select
                  v-model="studentData.class_id"
                  :items="classOptions"
                  label="Class"
                  item-title="title"
                  item-value="value"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Class is required']"
                />

                <!-- Address -->
                <v-text-field
                  v-model="studentData.address"
                  label="Address"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Address is required']"
                />

                <!-- Guardian Name -->
                <v-text-field
                  v-model="studentData.guardian_name"
                  label="Guardian Name"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Guardian name is required']"
                />

                <!-- Guardian Contact -->
                <v-text-field
                  v-model="studentData.guardian_contact"
                  label="Guardian Contact"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Guardian contact is required']"
                />

                <!-- Avatar with preview -->
                <div>
                  <v-file-input
                    :color="'#15803d'"
                    v-model="studentData.avatar_url"
                    label="Upload Avatar"
                    prepend-icon="mdi-account"
                    accept="image/*"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v) => !!v || 'Avatar is required']"
                    @change="previewAvatar"
                  />

                  <div v-if="avatarPreview" class="mt-2">
                    <v-img
                      :src="avatarPreview"
                      max-width="100"
                      max-height="100"
                      class="rounded"
                      contain
                    />
                  </div>
                </div>
              </div>

              <!-- Save button pinned at bottom -->
              <div class="sticky bottom-0 bg-white mt-4 py-3 border-t flex justify-end space-x-3">
                <!-- Cancel Button -->
                <v-btn variant="outlined" color="error" @click="resetFormAndClose"> Cancel </v-btn>

                <!-- Proceed Button with Icon -->
                <v-btn color="#15803d" variant="flat" @click="handlePreview">
                  Proceed
                  <v-icon class="ml-4" start icon="mdi-arrow-right-circle" />
                </v-btn>
              </div>
            </v-form>
          </div>

          <!-- Teachers Form -->
          <div v-else-if="activeTab === 'teachers'" key="teachers">
            <h2 class="text-lg font-semibold mb-4">Add Teacher</h2>
            <v-form
              ref="teacherFormRef"
              v-model="teacherFormValid"
              @submit.prevent="submitTeacher"
              class="relative"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                <v-text-field
                  v-model="teacherData.full_name"
                  label="Full Name"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Full name is required']"
                />
                <v-text-field
                  v-model="teacherData.email"
                  label="Email"
                  type="email"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Email is required']"
                />
                <v-text-field
                  v-model="teacherData.phone"
                  label="Phone"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Phone is required']"
                />
                <v-select
                  v-model="teacherData.subject_specializations"
                  :items="schoolSubjects"
                  item-title="subject_name"
                  item-value="school_subject_id"
                  label="Subject Specializations"
                  multiple
                  chips
                  :color="'#15803d'"
                  :chip-props="{ color: '#15803d', textColor: 'white' }"
                  variant="outlined"
                  density="comfortable"
                />

                <v-select
                  v-model="teacherData.main_class_id"
                  :items="schoolClasses"
                  item-title="name"
                  item-value="id"
                  label="Main Class Teacher"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                />

                <v-select
                  v-model="teacherData.other_class_ids"
                  :items="schoolClasses"
                  item-title="name"
                  item-value="id"
                  label="Other Classes"
                  multiple
                  chips
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                />

                <v-select
                  v-model="teacherData.gender"
                  :items="genderOptions"
                  label="Gender"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Gender is required']"
                />

                <!-- Date of Birth -->
                <v-menu :close-on-content-click="false" v-model="teacherDobMenu">
                  <template #activator="{ props }">
                    <v-text-field
                      :color="'#15803d'"
                      variant="outlined"
                      v-bind="props"
                      v-model="teacherDobText"
                      label="Date of Birth"
                      readonly
                    />
                  </template>
                  <v-date-picker v-model="teacherData.date_of_birth" @input="onTeacherDateSelected">
                    <template #actions>
                      <v-btn text @click="teacherDobMenu = false">Cancel</v-btn>
                      <v-btn text @click="teacherDobMenu = false">OK</v-btn>
                    </template>
                  </v-date-picker>
                </v-menu>

                <v-text-field
                  v-model="teacherData.address"
                  label="Address"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Address is required']"
                />

                <!-- Avatar upload -->
                <v-file-input
                  v-model="teacherData.avatar_url"
                  label="Upload Avatar"
                  prepend-icon="mdi-account"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Avatar is required']"
                  @change="previewTeacherAvatar"
                />
                <v-img
                  v-if="computedTeacherAvatarPreview"
                  :src="computedTeacherAvatarPreview"
                  max-width="100"
                  max-height="100"
                  class="mt-2"
                />
              </div>

              <!-- Fixed submit button at bottom -->
              <div class="sticky bottom-0 bg-white mt-4 py-3 border-t flex justify-end">
                <v-btn @click="handleTeacherPreview" color="#15803d" variant="flat">
                  Save Teacher
                </v-btn>
              </div>
            </v-form>
          </div>

          <!-- Employees form -->
          <div v-else-if="activeTab === 'employees'" key="employees">
            <h2 class="text-lg font-semibold mb-4">Add Employee</h2>
            <v-form
              ref="employeeFormRef"
              v-model="employeeFormValid"
              @submit.prevent="submitEmployee"
              class="relative"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-auto pr-2">
                <v-text-field
                  v-model="employeeData.full_name"
                  label="Full Name"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Full name is required']"
                />
                <v-text-field
                  v-model="employeeData.email"
                  label="Email"
                  type="email"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Email is required']"
                />
                <v-text-field
                  v-model="employeeData.phone"
                  label="Phone"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Phone is required']"
                />
                <v-select
                  v-model="employeeData.gender"
                  :items="genderOptions"
                  label="Gender"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Gender is required']"
                />

                <!-- Date of Birth -->
                <v-menu :close-on-content-click="false" v-model="employeeDobMenu">
                  <template #activator="{ props }">
                    <v-text-field
                      :color="'#15803d'"
                      variant="outlined"
                      v-bind="props"
                      v-model="employeeDobText"
                      label="Date of Birth"
                      readonly
                    />
                  </template>
                  <v-date-picker
                    v-model="employeeData.date_of_birth"
                    @input="onEmployeeDateSelected"
                  >
                    <template #actions>
                      <v-btn text @click="employeeDobMenu = false">Cancel</v-btn>
                      <v-btn text @click="employeeDobMenu = false">OK</v-btn>
                    </template>
                  </v-date-picker>
                </v-menu>

                <v-select
                  v-model="employeeData.position"
                  :items="positionOptions"
                  label="Position"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Position is required']"
                />
                <v-text-field
                  v-model="employeeData.hire_date"
                  label="Hire Date"
                  type="date"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Hire date is required']"
                />
                <v-text-field
                  v-model="employeeData.salary"
                  label="Salary"
                  type="number"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Salary is required']"
                />
                <v-text-field
                  v-model="employeeData.address"
                  label="Address"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'Address is required']"
                />

                <!-- Avatar Upload with Preview -->
                <v-file-input
                  v-model="employeeData.avatar_url"
                  label="Upload Avatar"
                  prepend-icon="mdi-account"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                  @change="previewEmployeeAvatar"
                  :rules="[(v) => !!v || 'Avatar is required']"
                />
                <v-img
                  v-if="employeeAvatarPreview"
                  :src="employeeAvatarPreview"
                  max-height="150"
                  max-width="150"
                  class="rounded mt-2"
                />
              </div>

              <!-- Fixed Save Button -->
              <v-btn
                type="submit"
                class="mt-4 w-full sticky bottom-0 bg-[#15803d] text-white"
                variant="flat"
              >
                Save Employee
              </v-btn>
            </v-form>
          </div>

          <!-- Subjects form -->
          <div v-else-if="activeTab === 'subjects'" key="subjects">
            <h2 class="text-lg font-semibold mb-4">Manage subjects in your school</h2>

            <v-form
              ref="subjectFormRef"
              v-model="schoolSubjectFormValid"
              @submit.prevent="submitSchoolSubject"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                <v-select
                  v-model="subjectData.subject_id"
                  :items="subjectsCatalogue"
                  item-value="id"
                  item-title="name"
                  label="Select Subject"
                  :rules="[(v) => !!v || 'Subject is required']"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                />

                <v-text-field
                  v-model="subjectData.custom_name"
                  label="Custom Name (optional)"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                />

                <v-text-field
                  v-model="subjectData.custom_code"
                  label="Custom Code (optional)"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                />
              </div>

              <div class="flex justify-end mt-4">
                <v-btn type="submit" color="#15803d" variant="flat">Add Subject</v-btn>
              </div>
            </v-form>
          </div>

          <div v-else-if="activeTab === 'classes'" key="classes">
            <h2 class="text-lg font-semibold mb-4">Manage classes in your school</h2>

            <v-form ref="classFormRef" v-model="classFormValid" @submit.prevent="submitClass">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                <v-text-field
                  v-model="classData.name"
                  label="Class Name"
                  :rules="[(v) => !!v || 'Class name is required']"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                />

                <v-text-field
                  v-model="classData.level"
                  label="Section (optional)"
                  :color="'#15803d'"
                  variant="outlined"
                  density="comfortable"
                />
              </div>

              <div class="flex justify-end mt-4">
                <v-btn type="submit" color="#15803d" variant="flat">Add Class</v-btn>
              </div>
            </v-form>
          </div>
        </transition>
      </div>
    </v-dialog>

    <!-- Add students preview modal -->
    <v-dialog v-model="showPreviewModal" max-width="600px">
      <div class="bg-white p-6 rounded-lg shadow-lg mx-auto">
        <h2 class="text-lg font-normal mb-4">Preview Student Details</h2>

        <div class="grid grid-cols-2 gap-4">
          <div><strong>Full Name:</strong> {{ studentData.full_name }}</div>
          <div><strong>Email:</strong> {{ studentData.email }}</div>
          <div><strong>Phone:</strong> {{ studentData.phone }}</div>
          <div><strong>Gender:</strong> {{ studentData.gender }}</div>
          <div><strong>Date of Birth:</strong> {{ studentData.date_of_birth }}</div>
          <div>
            <strong>Class:</strong>
            {{ classOptions.find((c) => c.value === studentData.class_id)?.title }}
          </div>
          <div class="col-span-2"><strong>Address:</strong> {{ studentData.address }}</div>
          <div><strong>Guardian Name:</strong> {{ studentData.guardian_name }}</div>
          <div><strong>Guardian Contact:</strong> {{ studentData.guardian_contact }}</div>

          <div class="col-span-2" v-if="computedAvatarPreview">
            <strong>Avatar Preview:</strong>
            <v-img
              v-if="computedAvatarPreview"
              :src="computedAvatarPreview"
              max-width="200"
              max-height="200"
              rounded
              cover
              contain
            />
          </div>
        </div>

        <div class="flex justify-end mt-6 space-x-3">
          <v-btn variant="outlined" color="grey" @click="showPreviewModal = false"> Edit </v-btn>
          <v-btn color="#15803d" variant="flat" @click="confirmSave"> Confirm & Save </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- Add teachers preview modal -->
    <v-dialog v-model="showTeacherPreviewModal" max-width="600px">
      <div class="bg-white p-6 rounded-lg shadow-lg mx-auto">
        <h2 class="text-lg font-normal mb-4">Preview Teacher Details</h2>

        <div class="grid grid-cols-2 gap-4">
          <div><strong>Full Name:</strong> {{ teacherData.full_name }}</div>
          <div><strong>Email:</strong> {{ teacherData.email }}</div>
          <div><strong>Phone:</strong> {{ teacherData.phone }}</div>
          <div><strong>Gender:</strong> {{ teacherData.gender }}</div>
          <div><strong>Date of Birth:</strong> {{ teacherData.date_of_birth }}</div>
          <div>
            <strong>Main Class:</strong>
            {{ schoolClasses.find((c) => c.id === teacherData.main_class_id)?.name }}
          </div>
          <div class="col-span-2">
            <strong>Other Classes:</strong>
            {{
              teacherData.other_class_ids
                .map((id) => schoolClasses.find((c) => c.id === id)?.name)
                .join(', ')
            }}
          </div>
          <div class="col-span-2">
            <strong>Subjects:</strong>
            {{
              teacherData.subject_specializations
                .map((id) => schoolSubjects.find((s) => s.school_subject_id === id)?.subject_name)
                .join(', ')
            }}
          </div>
          <div class="col-span-2"><strong>Address:</strong> {{ teacherData.address }}</div>

          <div class="col-span-2" v-if="computedTeacherAvatarPreview">
            <strong>Avatar Preview:</strong>
            <v-img
              :src="computedTeacherAvatarPreview"
              max-width="200"
              max-height="200"
              rounded
              cover
              contain
            />
          </div>
        </div>

        <div class="flex justify-end mt-6 space-x-3">
          <v-btn variant="outlined" color="grey" @click="showTeacherPreviewModal = false">
            Edit
          </v-btn>
          <v-btn color="#15803d" variant="flat" @click="confirmSaveTeacher"> Confirm & Save </v-btn>
        </div>
      </div>
    </v-dialog>
  </MainLayout>
</template>

<style scoped>
.el-message.el-message-top-left {
  left: 20px; /* push from the left */
  right: auto; /* override default center */
  transform: none; /* remove centering */
}

.custom-btn {
  background-color: #15803d;
}
.v-slider {
  --v-slider-track-size: 4px;
  --v-slider-thumb-size: 12px;
}

.v-tab {
  text-transform: none;
}
.v-btn {
  text-transform: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
:deep(.v-tab__slider) {
  height: 4px !important; /* Adjust thickness */
  background-color: #15803d !important; /* Change color if needed */
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
