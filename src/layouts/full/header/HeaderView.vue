<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api'
import { useLogout } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import gsap from 'gsap'

// ... your other code

const headerControls = ref(null)

const router = useRouter()
const userStore = useUserStore()
const { logout } = useLogout()

// Mode Switch
const isLiveMode = computed({
  get: () => userStore.user?.environment_mode === 'live',
  set: (val) => {
    const newMode = val ? 'live' : 'test'
    userStore.user.environment_mode = newMode
  }
})

const modeLoaded = ref(false)
const loadingMode = ref(false)

const fetchEnvironmentMode = async () => {
  try {
    const res = await api.get('/get-settings')
    console.log('environment mode:', res)
    const mode = res.data?.data?.environment_mode
    isLiveMode.value = mode === 'live'
  } catch (error) {
    console.error('Failed to fetch environment mode:', error)
  } finally {
    modeLoaded.value = true
  }
}

const syncEnvironmentMode = async () => {
  try {
    const res = await api.get('/get-settings')
    const mode = res.data?.data?.environment_mode
    isLiveMode.value = mode === 'live'
    userStore.user.environment_mode = mode
  } catch (error) {
    console.error('Failed to sync environment mode:', error)
  }
}

const toggleEnvironmentMode = async () => {
  try {
    loadingMode.value = true
    const newMode = isLiveMode.value ? 'live' : 'test'

    const res = await api.post('/update-setting', { key: 'environment_mode', value: newMode })
    console.log('toggle environment response:', res)

    // Optionally update store if needed
    userStore.user.environment_mode = newMode
  } catch (error) {
    console.error('Failed to update environment mode:', error)
  } finally {
    loadingMode.value = false
  }
}
// Logout
const submit = async () => {
  try {
    await logout()
    console.log('Logged out successfully')
  } catch (error) {
    console.log('Logout failed:', error?.response?.data?.message || error?.message)
  }
}

// User Data
const userName = computed(() => userStore.user?.name || 'User')
const userRole = computed(() => userStore.user?.role?.name || 'Role')
const userInitials = computed(() => {
  const name = userStore.user?.name || ''
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
})

onMounted(() => {
  syncEnvironmentMode()
  gsap.from(headerControls.value, {
    y: -50,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out'
  })
})
</script>

<template>
  <div v-if="userStore.user" class="header items-center px-4 py-4 bg-white">
    <!-- Icons (Right) -->
    <div class="space-x-4 flex" ref="headerControls">
      <div class="mt-2">
        <div class="mt-2">
          <el-switch
            v-model="isLiveMode"
            :loading="loadingMode"
            active-text="Live"
            inactive-text="Test"
            @change="toggleEnvironmentMode"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          />
        </div>
      </div>

      <v-menu offset-y location="bottom left" origin="top left" min-width="200">
        <template v-slot:activator="{ props }">
          <div
            v-bind="props"
            class="flex items-center cursor-pointer bg-white rounded-md px-2 py-1 hover:bg-gray-100 transition"
          >
            <v-avatar size="30" color="#1F5AA3" class="text-white font-bold p-4 text-sm">
              {{ userInitials }}
            </v-avatar>

            <div class="ml-2 text-left">
              <div class="font-semibold text-black text-sm">{{ userName }}</div>
              <div class="text-xs text-gray-500">{{ userRole }}</div>
            </div>
          </div>
        </template>

        <v-list>
          <v-list-item @click="submit" link class="text-gray-700 hover:text-red-500">
            <div class="flex items-center gap-2">
              <i class="fas fa-sign-out-alt text-gray-500 hover:text-red-500"></i>
              <v-list-item-title>Logout</v-list-item-title>
            </div>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- User Profile -->
      <!-- <v-menu anchor="bottom end" origin="auto" min-width="300">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" class="user-btn p-0" elevation="0" variant="text" :ripple="false">
            <v-avatar size="40" class="mr-2">
              <img src="@/assets/images/users/black-user.jpg" alt="User Avatar" />
            </v-avatar>

            <div class="d-flex flex-column">
              <span class="font-normal text-sm">John Doe</span>
              <span class="font-light text-xs">Super admin</span>
            </div>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="logout" link class="text-gray-700 hover:text-red-500">
            <div class="flex items-center gap-2">
              <i class="fas fa-sign-out-alt text-gray-500 hover:text-red-500"></i>
              <v-list-item-title>Logout</v-list-item-title>
            </div>
          </v-list-item>
        </v-list>
      </v-menu> -->
    </div>
  </div>
</template>

<style scoped>
v-btn {
  text-transform: none;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icons-container {
  display: flex;
  justify-content: flex-end;
  flex-grow: 1;
}

.search {
  flex-grow: 0;
}
</style>
