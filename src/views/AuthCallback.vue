<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const router = useRouter()

onMounted(async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Auth error:', error)
  } else {
    console.log('User:', data.session?.user)
  }
  setTimeout(() => {
    router.push('/login')
  }, 3000) // or wherever you want
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white shadow-lg rounded-lg p-12 max-w-lg text-center">
      <v-progress-circular indeterminate color="green" size="70" width="6" class="mb-4" />
      <h1 class="text-2xl font-bold text-gray-800">Processing...</h1>
      <p class="text-gray-600 mt-2">Your verification is being processed. Please wait.</p>
    </div>
  </div>
</template>
