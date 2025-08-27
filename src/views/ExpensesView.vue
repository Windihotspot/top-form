<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
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
          size="medium"
          class="normal-case custom-btn hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-md shadow-md"
        >
          <span
            class="bg-white text-blue-600 rounded-full p-1 flex items-center justify-center w-4 h-4 mr-2"
          >
            <i class="fa-solid fa-plus text-sm text-[#15803d]"></i>
          </span>
          Add new expenses
        </v-btn>
      </div>
    </div>


  </MainLayout>
</template>

<style scoped>
.custom-btn {
  background-color: #15803d;
  text-transform: none;
}
</style>
