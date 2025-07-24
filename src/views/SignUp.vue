<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { ElNotification, ElMessage } from 'element-plus'

const { signup, loading } = useAuth()
const router = useRouter()

// Form data
const schoolForm = ref({
  name: '',
  address: '',
  city: '',
  state: '',
  contact: '',
  type: ''
})

const adminForm = ref({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'Owner/Admin'
})

const steps = [
  { title: 'School Details', description: 'Enter your school information', icon: 'fa-home' },
  { title: 'Administrator Details', description: 'Enter admin personal details', icon: 'fa-user' },
  { title: 'Finish Setup', description: 'Complete your registration', icon: 'fa-check' }
]

// Steps and forms
const currentStep = ref(0)
const schoolFormRef = ref(null)
const adminFormRef = ref(null)
const isSchoolValid = ref(false)
const isAdminValid = ref(false)

// Navigation Methods
// Validation rules
const required = (v) => !!v || 'This field is required'
const emailRule = (v) => /.+@.+\..+/.test(v) || 'Enter a valid email'
const passwordRules = [
  (v) => !!v || 'Password is required',
  (v) => v.length >= 6 || 'Minimum 6 characters',
  (v) => /[A-Z]/.test(v) || 'At least one uppercase letter',
  (v) => /[0-9]/.test(v) || 'At least one number'
]

// Password strength
const passwordStrengthPercent = computed(() => {
  const p = adminForm.value.password
  let score = 0
  if (p.length >= 6) score += 30
  if (/[A-Z]/.test(p)) score += 30
  if (/[0-9]/.test(p)) score += 20
  if (/[^a-zA-Z0-9]/.test(p)) score += 20
  return score
})
const passwordStrengthColor = computed(() => {
  const val = passwordStrengthPercent.value
  if (val >= 80) return 'green'
  if (val >= 50) return 'orange'
  return 'red'
})

// Navigation logic
const prevStep = () => currentStep.value--
const nextStep = async () => {
  let formValidation = null

  if (currentStep.value === 0) {
    formValidation = await schoolFormRef.value?.validate()
  } else if (currentStep.value === 1) {
    formValidation = await adminFormRef.value?.validate()
  }

  if (formValidation?.valid) {
    currentStep.value++
  } else {
    ElNotification({
      
      message: 'Please fill in all required fields before proceeding.',
      type: 'warning',
      position: 'top-right',
      duration: 3000
    })
  }
}



</script>

<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div class="w-1/3 bg-white p-6 shadow-lg flex flex-col justify-between">
      <div>
        <ul class="space-y-6">
          <li
            v-for="(step, index) in steps"
            :key="index"
            class="flex items-start space-x-3"
            :class="index <= currentStep ? 'text-black' : 'text-gray-400'"
          >
            <i
              :class="[
                'fas',
                step.icon,
                'text-lg mt-1',
                index === currentStep ? 'text-green-700' : 'text-gray-400'
              ]"
            ></i>
            <div>
              <p :class="[index === currentStep ? 'font-semibold' : '']">{{ step.title }}</p>
              <p class="text-sm text-gray-400">{{ step.description }}</p>
            </div>
          </li>
        </ul>
      </div>

      <div class="flex justify-between items-center mt-4">
        <RouterLink to="/" class="text-gray-500 hover:underline"> Back to Home </RouterLink>
        <v-btn variant="text" color="primary" @click="router.push('/login')">
          Sign In <i class="fa-solid fa-arrow-right ml-2"></i>
        </v-btn>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-gray-50 p-10 overflow-auto">
      <div class="max-w-xl mx-auto space-y-4">
        <h2 class="text-2xl font-semibold">{{ steps[currentStep].title }}</h2>
        <p class="text-gray-500">{{ steps[currentStep].description }}</p>

        <!-- Step 1: School Details -->
        <v-form ref="schoolFormRef" v-model="isSchoolValid" v-if="currentStep === 0">
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="School Name"
            v-model="schoolForm.name"
            :rules="[required]"
          />
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="Address"
            v-model="schoolForm.address"
            :rules="[required]"
          />
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="City"
            v-model="schoolForm.city"
            :rules="[required]"
          />
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="State"
            v-model="schoolForm.state"
            :rules="[required]"
          />
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="Phone or Email"
            v-model="schoolForm.contact"
            :rules="[required]"
          />
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="School Type"
            v-model="schoolForm.type"
            :rules="[required]"
          />
        </v-form>

        <!-- Step 2: Admin Details -->
        <v-form ref="adminFormRef" v-model="isAdminValid" v-else-if="currentStep === 1">
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="Full Name"
            v-model="adminForm.fullName"
            :rules="[required]"
          />
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="Email Address"
            v-model="adminForm.email"
            :rules="[required, emailRule]"
          />
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="Phone Number"
            v-model="adminForm.phone"
            :rules="[required]"
          />
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="Role"
            v-model="adminForm.role"
            :rules="[required]"
          />
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="Password"
            v-model="adminForm.password"
            type="password"
            :rules="passwordRules"
          />
          <v-progress-linear
            :value="passwordStrengthPercent"
            :color="passwordStrengthColor"
            height="6"
            class="mb-2"
          ></v-progress-linear>
          <v-text-field
            variant="outlined"
            color="#15803d"
            label="Confirm Password"
            type="password"
            v-model="adminForm.confirmPassword"
            :rules="[(v) => v === adminForm.password || 'Passwords do not match']"
          />
        </v-form>

        <!-- Step 3: Finish -->
        <div v-else class="text-center space-y-4">
          <p class="text-lg">You're all set! Click below to go to your dashboard.</p>
          <iframe
            width="480"
            height="270"
            src="https://www.youtube.com/embed/5ShU93LVuq4?autoplay=1&mute=1"
            title="Welcome Video"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
            class="rounded-lg shadow mx-auto"
          ></iframe>
          <h2 class="text-2xl font-semibold">Welcome to School Manager!</h2>
          <p class="text-gray-500">Get up and running in 3 minutes.</p>
          <v-btn color="success" class="w-40" :loading="loading" @click="handleFinishSignup"
            >Finish up</v-btn
          >
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-4">
          <v-btn variant="outlined" :disabled="currentStep === 0" @click="prevStep"> Back </v-btn>
          <v-btn v-if="currentStep < steps.length - 1" color="primary" @click="nextStep">
            Next
          </v-btn>
        </div>

        <!-- Stepper Dots -->
        <div class="flex justify-center space-x-2 mt-6">
          <span
            v-for="(step, index) in steps"
            :key="index"
            class="h-2 w-10 rounded-full"
            :class="index === currentStep ? 'bg-green-700' : 'bg-gray-300'"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-text-field {
  margin-top: 10px;
}
</style>
