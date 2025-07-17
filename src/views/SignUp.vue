<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Form data
const schoolForm = ref({
  name: '',
  address: '',
  contact: '',
  type: '',
  sessionStart: '',
  sessionEnd: '',
  gradingSystem: ''
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

const currentStep = ref(0)
const router = useRouter()

// Navigation Methods
const nextStep = () => {
  if (currentStep.value < steps.length - 1) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const finishSetup = () => {
  console.log('School Form:', schoolForm.value)
  console.log('Admin Form:', adminForm.value)
  router.push('/dashboard')
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
        <div v-if="currentStep === 0">
          <v-text-field variant="outlined" color="#15803d" label="School Name" v-model="schoolForm.name" />
          <v-text-field variant="outlined" color="#15803d" label="Address" v-model="schoolForm.address" />
          <v-text-field variant="outlined" color="#15803d" label="City" v-model="schoolForm.address" />
          <v-text-field variant="outlined" color="#15803d" label="State" v-model="schoolForm.address" />
          <v-text-field variant="outlined" color="#15803d" label="Phone or Email" v-model="schoolForm.contact" />
          <v-text-field variant="outlined" color="#15803d" label="School Type" v-model="schoolForm.type" />
          
          
        </div>

        <!-- Step 2: Admin Details -->
        <div v-else-if="currentStep === 1">
          <v-text-field variant="outlined" color="#15803d" placeholder="Enter Full name"  v-model="adminForm.fullName" />
          <v-text-field variant="outlined" color="#15803d" placeholder="Enter email address"  v-model="adminForm.email" />
          <v-text-field variant="outlined" color="#15803d" placeholder="Enter Phone number"  v-model="adminForm.phone" />
           <v-text-field variant="outlined" color="#15803d" label="Role" v-model="adminForm.role"/>
          <v-text-field variant="outlined" color="#15803d" placeholder="Enter Full name" label="Password" type="password" v-model="adminForm.password" />
          <v-text-field variant="outlined" color="#15803d" label="Confirm Password" type="password" v-model="adminForm.confirmPassword" />
         
        </div>

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
          <v-btn color="success" class="w-40" @click="finishSetup">Finish up</v-btn>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-4">
          <v-btn variant="outlined" :disabled="currentStep === 0" @click="prevStep"> Back </v-btn>
          <v-btn
            v-if="currentStep < steps.length - 1"
            color="primary"
            @click="nextStep"
          >
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
