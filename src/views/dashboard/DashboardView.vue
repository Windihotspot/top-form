<script setup>
import { onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import api from '@/services/api'

const fetchStudends = async ()  => {
  const response = await api.get('/students')
  console.log("students response:", response)
}

onMounted(()=> {
  fetchStudends()
})
</script>

<template>
  <MainLayout>
   
  </MainLayout>
</template>

<style scoped>
.h-8 {
  height: 2rem;
}
v-btn {
  text-transform: none;
}
</style>
