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
                <v-btn size="small" color="primary" variant="flat">Apply Changes</v-btn>
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
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref } from 'vue'

const tab = ref('assignScores')

const tabs = [
  { label: 'Score Weights', value: 'scoreWeights' },
  { label: 'Assign Scores', value: 'assignScores' },
  { label: 'Thresholds', value: 'thresholds' },
  { label: 'Multipliers', value: 'multipliers' },
  { label: 'General Settings', value: 'generalSettings' }
]

const sliders = ref([
  { label: 'Client Type', value: 10 },
  { label: 'Income', value: 10 },
  { label: 'Industry Classification', value: 10 },
  { label: 'Duration in current employment', value: 10 },
  { label: 'Level of Education', value: 10 },
  { label: 'KYC Level', value: 10 },
  { label: 'Age', value: 10 },
  { label: 'Marital Status', value: 10 },
  { label: 'Gender', value: 10 },
  { label: 'Credit Score', value: 10 }
])

import { reactive } from 'vue'

const scoreData = reactive({
  'Client Type': [
    { label: 'New', score: 2 },
    { label: 'Repeat', score: 10 }
  ],
  Income: [
    { label: '500,000 and above', score: 10 },
    { label: '200,000 - 499,999', score: 8 },
    { label: '100,000 - 199,999', score: 6 },
    { label: '50,000 - 99,999', score: 4 },
    { label: 'Below 50,000', score: 2 }
  ],
  Gender: [
    { label: 'Male', score: 5 },
    { label: 'Female', score: 10 }
  ],
  'Marital Status': [
    { label: 'Married', score: 2 },
    { label: 'Single', score: 1.5 },
    { label: 'Divorced', score: 1 },
    { label: 'Widowed', score: 1 }
  ],
  'Residence Status': [
    { label: 'Owned', score: 10 },
    { label: 'Rented', score: 5 }
  ],
  Location: [
    { label: 'Lagos', score: 10 },
    { label: 'Abuja', score: 10 },
    { label: 'Rivers', score: 8 },
    { label: 'Ogun', score: 5 },
    { label: 'Others', score: 2 } // You can add more as needed
  ],
  'Level of Education': [
    { label: 'Post Graduate', score: 2 },
    { label: 'Graduate', score: 1.5 },
    { label: 'Secondary', score: 1 },
    { label: 'Primary', score: 1 }
  ],
  'Employment Duration': [
    { label: '6 years and above', score: 2 },
    { label: '3 - 5 years', score: 1.5 },
    { label: '2 years', score: 1 },
    { label: '1 year', score: 1 }
  ],
  'Employment Type': [
    { label: 'Employed', score: 2 },
    { label: 'Self Employed', score: 1.5 },
    { label: 'Student', score: 1 },
    { label: 'NYSC', score: 1 }
  ],
  'Industry Classification': [
    { label: 'Regulatory Agencies', score: 10 },
    { label: 'Telecommunication', score: 9 },
    { label: 'Financial Institutions (Banking)', score: 8 },
    { label: 'Others', score: 1 }
  ],
  'KYC Level': [
    { label: 'Level 3', score: 2 },
    { label: 'Level 2', score: 1.5 },
    { label: 'Level 1', score: 1 }
  ],
  'Credit Score': [
    { label: '850 and above', score: 10 },
    { label: 'Below 350', score: 2 }
  ],
  'Number of Closed Loans': [
    { label: 'Above 50', score: 10 },
    { label: 'Below 2', score: 2 }
  ],
  'Number of Written Off Loans': [
    { label: '0', score: 2 },
    { label: '3 and above', score: 1 }
  ],
  Age: [
    { label: '21 - 30 years', score: 2 },
    { label: '31 - 40 years', score: 1.5 },
    { label: '41 - 50 years', score: 1 },
    { label: '51 - 60 years', score: 1 },
    { label: '18 - 20 years', score: 1 }
  ]
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
