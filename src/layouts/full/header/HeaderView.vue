<script setup>
import { ref, computed } from 'vue'
import api from '@/api'
const status = ref(true)
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLogout } from '@/composables/useAuth'
const { logout } = useLogout()

const router = useRouter()
const userStore = useUserStore()

const submit = async () => {
  try {
    await logout()
    console.log('Logged out successfully')
  } catch (error) {
    console.log('Logout failed:', error?.response?.data?.message || error?.message)
  }
}


console.log('User store inside header:', {
  user: userStore.user,
  permissions: userStore.permissions
})

const userName = computed(() => userStore.user?.name || 'User')
const userRole = computed(() => userStore.user?.role?.name || 'Role')
const userInitials = computed(() => {
  const name = userStore.user?.name || ''
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[1][0]).toUpperCase()
})
</script>

<template>
  <div class="header items-center px-4 py-4 bg-white">
    <!-- Icons (Right) -->
    <div class="space-x-4 flex">
      <div class="mt-2">
        <el-switch
          v-model="status"
          class="mb-2"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          active-text="Live"
        />
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
