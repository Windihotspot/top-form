<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'
import PasswordPromptResetModal from '@/components/PasswordPromptResetModal.vue'
import HeaderView from './header/HeaderView.vue'
import SidebarView from './sidebar/SidebarView.vue'

const router = useRouter()
const userStore = useUserStore()

const showPasswordResetModal = ref(false)
const showPasswordReminderBanner = ref(false)
const remainingDaysToReset = ref(null)

const drawer = ref()
const innerW = window.innerWidth

// Simulate password changed 25 days ago (for testing)
// userStore.user.password_changed_at = dayjs().subtract(25, 'day').toISOString()

onMounted(() => {
  if (innerW < 950) {
    drawer.value = !drawer.value
  }

  const dismissedBanner = localStorage.getItem('password_banner_dismissed')
  if (dismissedBanner === 'true') return

  const lastPasswordReset = userStore.user?.password_changed_at
  if (lastPasswordReset) {
    const lastReset = dayjs(lastPasswordReset)
    const now = dayjs()
    const daysSinceReset = now.diff(lastReset, 'day')
    const remaining = 30 - daysSinceReset

    console.log(`Password was last reset ${daysSinceReset} days ago. Remaining days to reset: ${remaining}`)

    if (daysSinceReset >= 30) {
      showPasswordResetModal.value = true
    } else if (daysSinceReset >= 25) {
      remainingDaysToReset.value = remaining
      showPasswordReminderBanner.value = true
    }
  }
})

const dismissPasswordReminderBanner = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('password_banner_dismissed', 'true')
  }
  showPasswordReminderBanner.value = false
}
</script>

<template>
  <v-app>
    <!--- Header -->
    <!-- ---------------------------------------------- -->
    <v-app-bar app elevation="1" class="pa-2">
      <v-btn class="hidden-md-and-up" icon @click="drawer = !drawer">
        <v-icon>fa-solid fa-bars</v-icon>
      </v-btn>
      <div class="logo pa-6">
        <!-- <p class="font-semibold text-lg">FlowkyAi</p> -->
        <!-- <img src="/src/assets/images/white.png" class="" /> -->
      </div>
      <v-spacer></v-spacer>
      <HeaderView />
    </v-app-bar>
    <!-- ---------------------------------------------- -->
    <!--- Sidebar -->
    <!-- ---------------------------------------------- -->
    <v-navigation-drawer
      left
      :permanent="$vuetify.display.mdAndUp"
      elevation="1"
      app
      :temporary="$vuetify.display.mdAndDown"
      v-model="drawer"
      expand-on-hover
      class="side-bar"
    >
      <SidebarView />
    </v-navigation-drawer>

    <!-- ---------------------------------------------- -->

    <!-- ---------------------------------------------- -->
    <!--- Page Wrapper -->
    <!-- ---------------------------------------------- -->

    <v-main class="mt-4 page-wrapper">
      <v-container fluid class="page-wrapper">
        <transition name="slide-down">
          <v-banner
            v-if="showPasswordReminderBanner"
            class="password-banner mb-4 px-6 py-4"
            elevation="4"
            rounded
          >
            <!-- Close Icon -->
            <i
              class="fas fa-times absolute top-3 right-4 text-white cursor-pointer text-xl hover:text-gray-300"
              @click="dismissPasswordReminderBanner"
            />

            <!-- Icon on the left -->
            <template #prepend>
              <i class="fas fa-shield-alt text-white text-2xl mr-4"></i>
            </template>

            <template #text>
              <div class="text-white">
                <p class="text-lg font-semibold mb-1">Security Reminder</p>
                <p>
                  You have <strong>{{ remainingDaysToReset }}</strong> day<span
                    v-if="remainingDaysToReset > 1"
                    >s</span
                  >
                  left to reset your password for security reasons.
                </p>
              </div>
            </template>

            <template #actions>
              <v-btn
                color="#1f5aa3"
                class="text-white mt-6"
                variant="flat"
                @click="router.push('/resetpassword')"
              >
                Reset Password
              </v-btn>
            </template>
          </v-banner>
        </transition>

        <slot />
        <PasswordPromptResetModal v-model="showPasswordResetModal" />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.v-btn {
  text-transform: none;
}
.side-bar {
  overflow: hidden !important;
}

.side-bar::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.page-wrapper {
  background-color: #f5f7f9;
}

.settings-icon {
  position: fixed;
  bottom: 16px;
  right: 16px;
  font-size: 36px;
  color: #121621;
  animation: rotate 5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.slide-down-enter-active {
  animation: slideDown 0.4s ease-out;
}
.slide-down-leave-active {
  animation: slideUp 0.3s ease-in forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
/* Beautiful gradient style */
.password-banner {
  background: linear-gradient(90deg, #ff9800, #f44336);
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}
</style>
