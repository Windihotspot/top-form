<script setup>
import { ref } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'

const tab = ref('students')

const tabs = [
  { label: 'Students', value: 'students' },
  { label: 'Teachers', value: 'teachers' },
  { label: 'Employees', value: 'employees' }
]
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

      <v-tabs-window v-model="tab" class="mt-4">
        <v-tabs-window-item value="students">
          <div>Students</div>
        </v-tabs-window-item>

        <v-tabs-window-item value="teachers">
          <div>Teachers</div>
        </v-tabs-window-item>

        <v-tabs-window-item value="employees">
            <div>Employees</div> </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </MainLayout>
</template>
