<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useLogin } from '@/composables/useAuth'

const router = useRouter()
const showPassword = ref(false)
const loginFormRef = ref(null)

const email = ref('')
const password = ref('')
const remember = ref(false)
const processing = ref(false)
const formError = ref(null)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const emailRules = [
  (v) => !!v || 'Email is required',
  (v) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [(v) => !!v || 'Password is required']

const { login } = useLogin()

const submitForm = async () => {
  formError.value = null
  const isValid = await loginFormRef.value?.validate()

  if (!isValid) return

  processing.value = true
  try {
    await login(email.value, password.value)
    router.push('/dashboard')
    // Optional: Redirect here if needed
  } catch (err) {
    formError.value =
      err?.errors?.email?.[0] ||
      err?.errors?.password?.[0] ||
      'Login failed. Please check your credentials.'
  } finally {
    processing.value = false
  }
}

const slides = ref([
  {
    title: 'Credit Decision AI',
    text:
      'Of all document fraud cases, 51% involve an ID card, 27% a driver’s license, and 19% a passport. With FlowkyAI, you can mitigate these risks effectively.'
  },
  {
    title: 'Credit Decision AI',
    text:
      'Detect and prevent fraud before it happens using intelligent real-time algorithms designed for document and identity verification.'
  },
  {
    title: 'Credit Decision AI',
    text:
      'Seamlessly integrate verification and compliance into your workflows to ensure trust, security, and speed in every credit decision.'
  }
])

const currentSlide = ref(0)

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}


let interval = ref(null)

onMounted(() => {
  interval = setInterval(nextSlide, 3000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="flex flex-col md:flex-row h-auto h-screen bg-white">
    <!-- Image Section -->
    <!-- Left Section with Carousel -->
    <div
      class="w-full md:w-1/2 h-full p-8 bg-[#1f5aa3] text-white relative flex flex-col justify-between"
    >
      <div class="flex items-center px-2">
        <span class="text-md font-semibold">FlowkyAI</span>
      </div>

      <div class="flex-1 flex items-center justify-center text-center px-4">
        <div>
          <!-- Image -->
          <!-- <img :src="slides[currentSlide].image" alt="Slide Image" class="mx-auto h-40 mb-4" /> -->

          <!-- Text -->
          <h2 class="text-xl font-bold mb-2">{{ slides[currentSlide].title }}</h2>
          <p class="text-sm">{{ slides[currentSlide].text }}</p>

          <!-- Dots -->
          <div class="flex justify-center gap-2 mt-4">
            <span
              v-for="(slide, index) in slides"
              :key="index"
              class="h-2 w-6 rounded-full transition-all duration-300"
              :class="{
                'bg-white': currentSlide === index,
                'bg-white/50': currentSlide !== index
              }"
            ></span>
          </div>
        </div>
      </div>

      <!-- Arrows -->
      <div class="absolute bottom-4 right-8 flex gap-3">
        <button @click="prevSlide" class="">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button @click="nextSlide" >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

     <!-- Login Form Section -->
  <div class="w-full md:w-1/2 pt-8 flex items-center justify-center bg-white h-full">
    <div class="max-w-md w-full px-4 sm:px-6 lg:px-8 py-8 md:py-0">
      <v-alert v-if="formError" type="error" density="compact" class="mb-2 py-1 px-2 text-sm">
        {{ formError }}
      </v-alert>
      <h1 class="text-3xl font-bold text-gray-800 text-center">Welcome back!</h1>
      <p class="text-gray-600 mt-2 text-center">
        Provide your login credentials to access your account
      </p>

      <!-- Vuetify Form -->
      <v-form ref="loginFormRef" @submit.prevent="submitForm" class="mt-6 space-y-4">
        <!-- Global Form Error -->

        <!-- Email Field -->
        <v-text-field
          v-model="email"
          label="Email address"
          variant="outlined"
          color="#1f5aa3"
          :rules="emailRules"
          required
        />

        <!-- Password Field -->
        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          variant="outlined"
          color="#1f5aa3"
          :rules="passwordRules"
          required
        >
          <template #append-inner>
            <i
              :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
              @click="togglePasswordVisibility"
              class="cursor-pointer text-black"
            ></i>
          </template>
        </v-text-field>

        <!-- Remember me and Forgot -->
        <div class="flex items-center justify-between">
          <label class="flex items-center space-x-2">
            <el-checkbox v-model="remember" size="large" />
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

        <!-- Warning -->
        <div class="bg-red-100 text-red-800 text-sm p-3 rounded">
          <span class="font-bold mr-1">Warning:</span>
          Don’t tick this box if you are using a public or shared device
        </div>

        <!-- Submit Button -->
        <v-btn
          type="submit"
          :loading="processing"
          :disabled="!email || !password || processing"
          :class="{
            'custom-btn-disabled': !email || !password || processing
          }"
          class="w-full text-white font-semibold text-sm custom-btn"
          height="40"
        >
          {{ processing ? 'Signing in...' : 'Sign in' }}
        </v-btn>
      </v-form>
    </div>
  </div>
  </div>

 
</template>

<style scoped>
.custom-btn {
  background-color: #1f5aa3;
}
.v-btn {
  text-transform: none;
}
.custom-btn-disabled {
  background-color: #647f9b !important; /* Light blue-gray */
  color: #ffffff !important;
  opacity: 1 !important; /* prevent Vuetify from reducing visibility */
  cursor: not-allowed;
}
</style>
