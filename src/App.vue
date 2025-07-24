<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  // userStore.initFromStorage()
  // console.log('User store on app init:', {
  //   user: userStore.user,
  //
  //   token: userStore.token
  // })
})
</script>

<template>
  <main class="text-neutral-800">
    <RouterView />
  </main>
</template>
