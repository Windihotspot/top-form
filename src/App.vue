<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'

// const userStore = useUserStore()
// userStore.initFromStorage()

// console.log('User store on app init:', {
//   user: userStore.user,
//   permissions: userStore.permissions,
//   token: userStore.token
// })

</script>

<template>
  <main class="text-neutral-800">
    <RouterView />
  </main>
</template>
