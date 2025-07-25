<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import api from '@/services/api'
const loading = ref(true)
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
  { label: 'Employees', value: 'employees' }
]

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
      <h2 class="text-md font-semibold mb-4">Database</h2>

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

      <div
        v-if="loading"
        class="fill-height d-flex justify-center align-center mx-auto items-center flex my-auto mx-auto"
      >
        <v-progress-circular indeterminate color="success" size="48" />
      </div>
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
  </MainLayout>
</template>

<style scoped>
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
