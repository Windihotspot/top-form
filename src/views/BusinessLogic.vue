<template>
  <MainLayout>
    <div class="px-6 py-4">
      <h2 class="text-lg font-semibold mb-4">Business Logic</h2>

      <v-tabs v-model="tab" color="blue" class="border-b border-blue-200" density="compact">
        <v-tab
          v-for="item in tabs"
          :key="item.value"
          :value="item.value"
          class="text-sm capitalize"
          :class="{
            'text-black font-semibold border-b-2 border-blue-600': tab === item.value,
            'text-gray-500': tab !== item.value
          }"
        >
          {{ item.label }}
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab" class="mt-4">
        <v-tabs-window-item value="scoreWeights">
          <!-- Replace with actual HTML or components -->
          <div>
            <p class="text-sm text-gray-600">Adjust your weights used in the scoring mechanism</p>
          </div>

          <div class="p-6 bg-white rounded mt-4">
            <div class="flex justify-between mb-6">
              <v-btn color="primary" variant="flat" size="small">Add new</v-btn>

              <div class="space-x-2">
                <v-btn
                  color="primary"
                  variant="flat"
                  size="small"
                  @click="applyScoreWeights"
                  :loading="saving"
                  :disabled="saving"
                >
                  Apply Changes
                </v-btn>
                <v-btn size="small" color="success" variant="flat">Deploy Changes</v-btn>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div v-for="(item, index) in sliders" :key="index" class="flex flex-col space-y-2">
                <label class="text-sm font-medium text-gray-700">{{ item.label }}</label>
                <v-slider
                  v-model="item.value"
                  :min="1"
                  :max="20"
                  step="1"
                  hide-details
                  color="primary"
                  thumb-label
                  class="pt-2"
                />
                <div class="flex justify-between text-sm text-gray-500">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="assignScores">
          <div class="p-6 bg-white rounded shadow">
            <h2 class="text-2xl font-semibold mb-6">Assign Scores</h2>

            <div class="mt-4 mb-4 flex justify-end gap-4">
              <div class="space-x-2">
                <v-btn size="small" color="primary" variant="flat">Apply Changes</v-btn>
                <v-btn size="small" color="success" variant="flat">Deploy Changes</v-btn>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div v-for="(category, key) in scoreData" :key="key">
                <h3 class="font-semibold text-sm mb-2">{{ key }}</h3>
                <div class="space-y-2">
                  <div
                    v-for="item in category"
                    :key="item.label"
                    class="flex items-center justify-between"
                  >
                    <span>{{ item.label }}</span>
                    <input
                      type="number"
                      class="w-20 px-2 py-1 border rounded text-right"
                      v-model.number="item.score"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="thresholds">
          <div class="p-6 bg-white rounded">
            <div class="flex justify-between mb-6 justify-end">
              <div class="space-x-2">
                <v-btn size="small" color="primary" variant="flat">Apply Changes</v-btn>
                <v-btn size="small" color="success" variant="flat">Deploy Changes</v-btn>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <!-- Left Column -->
              <div>
                <v-text-field
                  label="Minimum Credit Score"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </div>

              <div>
                <v-text-field
                  label="Minimum Tenor"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </div>

              <div>
                <v-text-field
                  label="Maximum Written Off Loan"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </div>

              <div>
                <v-text-field
                  label="Maximum Tenor"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </div>

              <div>
                <v-text-field
                  label="Maximum Delinquent Loans"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </div>

              <div>
                <v-text-field
                  label="Minimum Age"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </div>

              <div>
                <v-text-field
                  label="Minimum Internal Score"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </div>

              <div>
                <v-text-field
                  label="Maximum Age"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </div>
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="multipliers">
          <div class="bg-white rounded p-4">
            <div class="flex justify-between mb-6 justify-end">
              <div class="space-x-2">
                <v-btn size="small" color="primary" variant="flat">Apply Changes</v-btn>
                <v-btn size="small" color="success" variant="flat">Deploy Changes</v-btn>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- Tenor Multipliers -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Tenor Multipliers</h3>
                <v-text-field label="30 Days Tenor Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="60 Days Tenor Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="90 Days Tenor Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="120 Days Tenor Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="180 Days Tenor Multiplier" variant="outlined"></v-text-field>
              </div>

              <!-- Internal Score Multipliers -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Internal Score Multipliers</h3>
                <v-text-field label="Score > 760 Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="Score 501–600 Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="Score 451–500 Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="Score 351–450 Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="Score < 350 Multiplier" variant="outlined"></v-text-field>
              </div>

              <!-- Credit Score Multipliers -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Credit Score Multipliers</h3>
                <v-text-field label="Score > 760 Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="Score 501–600 Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="Score 451–500 Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="Score 351–450 Multiplier" variant="outlined"></v-text-field>
                <v-text-field label="Score < 350 Multiplier" variant="outlined"></v-text-field>
              </div>

              <!-- Income Multipliers -->
              <div>
                <h3 class="text-lg font-semibold mb-4 mt-8 md:mt-0">Income Multipliers</h3>
                <v-text-field label="200,000 and above" variant="outlined"></v-text-field>
                <v-text-field label="100,000 – 199,999" variant="outlined"></v-text-field>
                <v-text-field label="90,000 – 99,999" variant="outlined"></v-text-field>
                <v-text-field label="80,000 – 89,999" variant="outlined"></v-text-field>
                <v-text-field label="70,000 – 79,999" variant="outlined"></v-text-field>
              </div>

              <!-- Ontime Repayment Multipliers -->
              <div>
                <h3 class="text-lg font-semibold mb-4 mt-8 md:mt-0">
                  Ontime Repayment Multipliers
                </h3>
                <v-text-field label="100%" variant="outlined"></v-text-field>
                <v-text-field label=">= 80%" variant="outlined"></v-text-field>
                <v-text-field label=">= 70%" variant="outlined"></v-text-field>
                <v-text-field label=">= 60%" variant="outlined"></v-text-field>
                <v-text-field label=">= 50%" variant="outlined"></v-text-field>
              </div>
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="generalSettings">
          <div class="bg-white rounded p-4">
            <div class="flex justify-between mb-6 justify-end">
              <div class="space-x-2">
                <v-btn size="small" color="primary" variant="flat">Apply Changes</v-btn>
                <v-btn size="small" color="success" variant="flat">Deploy Changes</v-btn>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Side -->
              <div class="space-y-4">
                <v-text-field label="Base Loan Value (₦)" variant="outlined" hide-details />
                <v-text-field label="Minimum Loan Amount (₦)" variant="outlined" hide-details />
                <v-text-field label="Maximum Loan Amount (₦)" variant="outlined" hide-details />
              </div>

              <!-- Right Side -->
              <div class="space-y-4">
                <v-text-field label="Minimum Age for Loans" variant="outlined" hide-details />

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tenors</label>
                  <div class="bg-gray-100 p-4 rounded-md flex flex-wrap gap-2">
                    <span class="bg-blue-600 text-white text-sm px-3 py-1 rounded-md">30 ×</span>
                    <span class="bg-blue-600 text-white text-sm px-3 py-1 rounded-md">60 ×</span>
                    <span class="bg-blue-600 text-white text-sm px-3 py-1 rounded-md">90 ×</span>
                    <span class="bg-blue-600 text-white text-sm px-3 py-1 rounded-md">120 ×</span>
                    <span class="bg-blue-600 text-white text-sm px-3 py-1 rounded-md">180 ×</span>
                    <span class="bg-blue-600 text-white text-sm px-3 py-1 rounded-md">270 ×</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top end"
      timeout="4000"
      class="text-white"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'

const saving = ref(false)
const loading = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success' // success, error, warning, info
})

function showSnackbar(message, color = 'success') {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

const tab = ref('scoreWeights')

const tabs = [
  { label: 'Score Weights', value: 'scoreWeights' },
  { label: 'Assign Scores', value: 'assignScores' },
  { label: 'Thresholds', value: 'thresholds' },
  { label: 'Multipliers', value: 'multipliers' },
  { label: 'General Settings', value: 'generalSettings' }
]

const sliders = ref([])

const scoreData = reactive({})

// Original field labels mapped to API keys
const weightFields = [
  { label: 'Client Type', key: 'client_type' },
  { label: 'Income', key: 'stated_income' },
  { label: 'Industry Classification', key: 'industry_classification' },
  { label: 'Duration in current employment', key: 'duration_in_current_employment' },
  { label: 'Level of Education', key: 'level_of_education' },
  { label: 'KYC Level', key: 'kyc_score' },
  { label: 'Age', key: 'age' },
  { label: 'Marital Status', key: 'marital_status' },
  { label: 'Gender', key: 'gender' },
  { label: 'Credit Score', key: 'credit_bureau_score' }
  // You can add more fields below if needed
]

// Fetch weights
const fetchWeights = async () => {
  loading.value = true
  try {
    const response = await api.get('/get-sofri-weights') // replace with your actual endpoint
    console.log('sofri weights:', response.data.data)
    const weights = response.data.data

    sliders.value = weightFields.map((field) => ({
      label: field.label,
      key: field.key,
      value: weights[field.key] ?? 10 // fallback to 10 if key not in response
    }))
  } catch (error) {
    console.log('Failed to fetch score weights:', error)
  } finally {
    loading.value = false
  }
}

const applyScoreWeights = async () => {
  saving.value = true
  const weightsPayload = {}
  sliders.value.forEach((slider) => {
    weightsPayload[slider.key] = slider.value
  })
  console.log('adjust weights payload:', weightsPayload)
  try {
    const response = await api.post('/adjust-weights', {
      weights: weightsPayload
    })
    console.log('adjust weights response:', response)
    showSnackbar(response.data.data.message, 'success')
  } catch (error) {
    const errorMessage = error?.response?.data?.data?.error || 'Failed to apply score weights'
    console.log('Failed to save weights:', errorMessage)
    showSnackbar(errorMessage, 'error')
  } finally {
    saving.value = false
  }
}

const formatScoreData = (rawData) => {
  const result = {}

  for (const key in rawData) {
    const value = rawData[key]

    // Handle range arrays like income, age, etc.
    if (Array.isArray(value) && Array.isArray(value[0])) {
      result[formatKey(key)] = value.map(([min, max, score]) => ({
        label: `${formatNumber(min)} – ${formatNumber(max)}`,
        score
      }))
    }

    // Handle key-value object mappings
    else if (typeof value === 'object' && value !== null) {
      result[formatKey(key)] = Object.entries(value).map(([label, score]) => ({
        label,
        score
      }))
    }
  }

  return result
}

const formatKey = (key) => {
  const mappings = {
    client_type: 'Client Type',
    stated_income: 'Income',
    gender: 'Gender',
    marital_status: 'Marital Status',
    duration_in_current_employment: 'Employment Duration',
    employment_type: 'Employment Type',
    level_of_education: 'Level of Education',
    age: 'Age',
    industry_classification: 'Industry Classification',
    residence_status: 'Residence Status',
    location: 'Location',
    kyc_score: 'KYC Level',
    credit_bureau_score: 'Credit Score',
    Count_AccountStatus_Closed: 'Number of Closed Loans',
    Count_AccountStatus_Written_Off: 'Number of Written Off Loans',
    Count_AccountStatus_Delinquent_30_over_60_days: 'Number of Delinquent Loans'
  }

  return mappings[key] || key
}

const formatNumber = (num) => (num >= 1000 ? Intl.NumberFormat().format(num) : num.toString())

const fetchScoreData = async () => {
  try {
    const response = await api.get('/get-sofri-scores') 
    console.log('score data response:', response.data.data)

    const formatted = formatScoreData(response.data.data)
    Object.assign(scoreData, formatted) // reactive assignment
  } catch (error) {
    console.log('Failed to fetch score data:', error)
    showSnackbar('Failed to load score data', 'error')
  }
}

onMounted(() => {
  fetchWeights()
  fetchScoreData()
})
</script>

<style scoped>
.v-tab {
  text-transform: none;
}
.v-btn {
  text-transform: none;
}
</style>
