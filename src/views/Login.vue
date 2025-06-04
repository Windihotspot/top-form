<script setup>
import { ref } from 'vue'

import { useRouter } from 'vue-router'
const router = useRouter()

const loginForm = ref({
  email: '',
  password: '',
  remember: false,
  errors: {
    email: '',
    password: ''
  },
  processing: false
})
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
// Handle Login Submission
</script>

<template>
  <div class="flex flex-col md:flex-row h-auto h-screen bg-white">
    <!-- Image Section -->

    <div class="w-full sm:w-full md:w-1/2 h-full p-8 bg-[#1f5aa3]">
      <!-- Logo -->
      <div class="flex items-center px-2">
        <span class="text-md font-semibold text-white">FlowkyAI</span>
      </div>

      <!-- Vertically centered text -->
      <div class="flex flex-1 items-center h-[calc(100%-2rem)]">
        <p class="font-bold text-white text-3xl">Credit Decision With AI</p>
      </div>
    </div>

    <!-- Login Form Section -->
    <div class="w-full md:w-1/2 pt-8 flex items-center justify-center bg-white h-full">
      <div class="max-w-md w-full px-4 sm:px-6 lg:px-8 py-8 md:py-0">
        <!-- Heading -->
        <h1 class="text-3xl font-bold text-gray-800 text-center">Welcome back!</h1>
        <p class="text-gray-600 mt-2 text-center">
          Provide your login credentials to access your account
        </p>

        <!-- Login Form -->
        <form @submit.prevent="submitForm" class="mt-6 space-y-4">
          <!-- Email Error -->
          <p v-if="loginForm.errors.email" class="text-red-500 text-sm">
            {{ loginForm.errors.email }}
          </p>

          <!-- Email Input -->
          <v-text-field
            type="email"
            label="Email address"
            v-model="loginForm.email"
            variant="outlined"
            color="blue"
          />

          <!-- Password Error -->
          <p v-if="loginForm.errors.password" class="text-red-500 text-sm">
            {{ loginForm.errors.password }}
          </p>

          <!-- Password Input -->
          <v-text-field
            :type="showPassword ? 'text' : 'password'"
            v-model="loginForm.password"
            label="Password"
            variant="outlined"
            color="blue"
          >
            <template #append-inner>
              <i
                :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                @click="togglePasswordVisibility"
                class="cursor-pointer text-black"
              ></i>
            </template>
          </v-text-field>

          <!-- Remember me + Reset -->
          <div class="flex items-center justify-between">
            <label class="flex items-center space-x-2">
              <el-checkbox v-model="loginForm.remember" size="large" />
              <span class="text-sm text-gray-700">Remember me</span>
            </label>

            <RouterLink to="/resetpassword">
              <v-btn
                no-uppercase
                variant="text"
                size="small"
                color="#1f5aa3"
                class="normal-case text-none"
              >
                Forgot password?
              </v-btn>
            </RouterLink>
          </div>

          <div class="bg-red-100 text-red-800 text-sm p-3 rounded">
            <span class="font-bold mr-1">Warning:</span>
            Don’t tick this box if you are using a public or shared device
          </div>

          <!-- Submit Button -->
          <v-btn
            type="submit"
            :loading="loginForm.processing"
            class="w-full text-white font-semibold text-sm custom-btn"
            height="40"
          >
            {{ loginForm.processing ? 'Signing in...' : 'Sign in' }}
          </v-btn>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
/* Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.4s ease-in-out,
    opacity 0.4s;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.custom-btn {
  background-color: #1f5aa3;
}
.v-btn {
  text-transform: none;
}
</style>
