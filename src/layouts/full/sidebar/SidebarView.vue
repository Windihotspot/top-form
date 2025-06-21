<script setup>
import { ref, computed } from 'vue'
import sidebarItems from './sidebarItem'
import { useRoute, useRouter } from 'vue-router'

import { useUserStore } from '@/stores/user' // 👈 You should be using userStore here


const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

console.log('User permissions:', {
  permissions: userStore.permissions
})


// Determine which routes the user can see
const filteredSidebar = computed(() => {
  return sidebarItems.filter(item => {
    if (!item.permission) return true // If no permission needed, allow
    return userStore.hasPermission(item.permission) // Check permission via userStore
  })
  
})



// Function to check if the current route is active
const isActive = (path) => {
  return route.path === path
}



</script>

<template>
  <div class="side-bar mt-4 d-flex flex-column h-full justify-between overflow-hidden">
    <!-- Logo part -->
    <!-- <div class="logo pa-4">
      <img src="/src/assets/images/white.png" class="" />
    </div> -->

    <div class="flex items-center space-x-3 p-4 border-b">
      <i class="fa-solid fa-columns text-gray-700 text-xl"></i>
    </div>
    <!-- Navigation -->
    <div class="flex-grow mt-4">
      <v-list class="pa-4">
        <template v-for="(item, i) in filteredSidebar" :key="i">
          <v-list-item
            @click="router.push(item.path)"
            class="mb-4 pr-4 custom-btn no-uppercase relative"
            size="small"
            rounded="lg"
            block
            :class="{ 'custom-active': isActive(item.path) }"
          >
            <div class="flex items-center w-full">
              <v-icon left>{{ item.icon }}</v-icon>
              <span class="menu-item ml-4" v-text="item.title"></span>
            </div>

            <!-- Active bar INSIDE the v-list-item -->
          </v-list-item>
          <!-- <div v-if="isActive(item.path)" class="active-bar"></div> -->
        </template>
      </v-list>
    </div>

    <!-- Footer Logout -->
    <!-- <div class="pa-4">
      <v-list-item @click="logout" class="custom-btn logout-btn" rounded="lg" block>
        <v-icon class="text-lg" left>
          <i class="fas fa-sign-out-alt"></i>
        </v-icon>
        <span class="menu-item ml-4">Logout</span>
      </v-list-item>
    </div> -->
  </div>
</template>

<style scoped>
.side-bar {
  overflow: hidden !important;
}

.logout-btn:hover {
  background-color: #ffecec;
}

.logo {
  width: 50%;
}
.menu-item {
  font-size: 36px;
  text-transform: none;
  color: #1e1e1e;
}

.custom-btn:hover {
  background-color: #e8f0fe;
}

.custom-btn {
  text-align: left;
  justify-content: flex-start;
  transition: background-color 0.2s ease;
}
.custom-btn .v-icon {
  margin-right: 8px;
  color: #1e1e1e;
}
.custom-btn .menu-item {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Helvetica,
    Arial,
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 28px;
}
.custom-link {
  text-decoration: none; /* Remove underline from Link */
}

.custom-active {
  color: #1f5aa3 !important; /* Active state color */
  background-color: rgba(0, 0, 255, 0.1); /* Light blue background */

  border-radius: 12px;
}

.custom-active .menu-item {
  color: #1f5aa3 !important;
}

.custom-active .v-icon {
  color: #1f5aa3 !important;
}
.active-bar {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 4px;
  height: 40px; /* Adjust to match your button height */
  background-color: #1f5aa3;
  border-radius: 8px;
}
</style>
