<template>
  <MainLayout>
    <div class="px-6 py-4">
      <h2 class="text-md font-semibold mb-4">Business Logic</h2>

      <v-tabs v-model="tab" density="compact">
        <v-tab
        :disabled="loading"
          v-for="item in tabs"
          :key="item.value"
          :value="item.value"
          class="border-b-4 border-blue-700"
          slider-size="8"
          :class="{
            'text-black font-semibold': tab === item.value,
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
          <!-- Toast Notification -->

          <div class="p-6 bg-white rounded mt-4">
            <div class="flex justify-end mb-6">
              <div class="space-x-2">
                <v-btn
                  color="primary"
                  variant="flat"
                  size="small"
                  @click="() => runWeightAction('apply')"
                  :loading="savingApply"
                  :disabled="savingApply"
                >
                  Apply Changes
                </v-btn>

                <v-btn
                  size="small"
                  color="success"
                  variant="flat"
                  @click="() => runWeightAction('deploy')"
                  :loading="savingDeploy"
                  :disabled="!batchId || savingDeploy"
                >
                  Deploy Changes
                </v-btn>
              </div>
            </div>

            <div v-if="loading" class="flex items-center justify-center py-10">
              <v-progress-circular indeterminate color="primary" size="40" />
            </div>

            <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
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
            <div class="mt-4 mb-4 flex justify-end gap-4">
              <div class="space-x-2">
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  :loading="savingScoreApply"
                  :disabled="savingScoreApply"
                  @click="() => runScoreDataAction('apply')"
                >
                  Apply Changes
                </v-btn>

                <v-btn
                  size="small"
                  color="success"
                  variant="flat"
                  :loading="savingScoreDeploy"
                  :disabled="!scoreBatchId || savingScoreDeploy"
                  @click="() => runScoreDataAction('deploy')"
                >
                  Deploy Changes
                </v-btn>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div v-for="(category, key) in scoreData" :key="key">
                <h3 class="font-semibold text-xs mb-2">{{ key }}</h3>
                <div class="space-y-2">
                  <div
                    v-for="item in category.items"
                    :key="item.label"
                    class="flex items-center justify-between text-xs"
                  >
                    <span>{{ item.label }}</span>
                    <input
                      type="number"
                      class="w-20 px-2 py-1 border rounded no-spinner text-xs"
                      v-model.number="item.score"
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
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  :loading="savingThresholdApply"
                  :disabled="savingThresholdApply"
                  @click="() => runThresholdAction('apply')"
                >
                  Apply Changes
                </v-btn>

                <v-btn
                  size="small"
                  color="success"
                  variant="flat"
                  :loading="savingThresholdDeploy"
                  :disabled="!thresholdBatchId || savingThresholdDeploy"
                  @click="() => runThresholdAction('deploy')"
                >
                  Deploy Changes
                </v-btn>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div class="flex flex-col space-y-1">
                <label class="text-sm font-medium text-gray-700">Minimum Loan Amount (₦)</label>
                <v-text-field
                  type="number"
                  v-model.number="thresholds.minimum_loan_amount"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>

              <div class="flex flex-col space-y-1">
                <label class="text-sm font-medium text-gray-700">Maximum Loan Amount (₦)</label>
                <v-text-field
                  type="number"
                  v-model.number="thresholds.maximum_loan_amount"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>

              <div class="flex flex-col space-y-1">
                <label class="text-sm font-medium text-gray-700">Minimum Loan Age</label>
                <v-text-field
                  type="number"
                  v-model.number="thresholds.minimum_loan_age"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>

              <div class="flex flex-col space-y-1">
                <label class="text-sm font-medium text-gray-700">Maximum Loan Age</label>
                <v-text-field
                  type="number"
                  v-model.number="thresholds.maximum_loan_age"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="multipliers">
          <div class="bg-white rounded p-4">
            <div class="flex justify-between mb-8 justify-end">
              <div class="space-x-2">
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  :loading="savingMultiplierApply"
                  @click="runMultiplierAction('apply')"
                  >Apply Changes</v-btn
                >

                <v-btn
                  size="small"
                  color="success"
                  variant="flat"
                  :loading="savingMultiplierDeploy"
                  @click="runMultiplierAction('deploy')"
                  >Deploy Changes</v-btn
                >
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- Internal Score Multipliers -->
              <!-- Internal Score Multipliers -->
              <div>
                <h3 class="text-sm font-semibold mb-4">Internal Score Multipliers</h3>
                <div class="flex flex-col space-y-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score &gt; 760 Multiplier</label
                    >
                    <v-text-field
                      v-model.number="multipliers.sofri_score_multipliers[701]"
                      type="number"
                      variant="outlined"
                      hide-details
                      density="compact"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score 601–700 Multiplier</label
                    >
                    <v-text-field
                      v-model.number="multipliers.sofri_score_multipliers[601]"
                      type="number"
                      variant="outlined"
                      hide-details
                      density="compact"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score 501–600 Multiplier</label
                    >
                    <v-text-field
                      v-model.number="multipliers.sofri_score_multipliers[501]"
                      type="number"
                      variant="outlined"
                      hide-details
                      density="compact"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score 451–500 Multiplier</label
                    >
                    <v-text-field
                      v-model.number="multipliers.sofri_score_multipliers[451]"
                      type="number"
                      variant="outlined"
                      hide-details
                      density="compact"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score 351–450 Multiplier</label
                    >
                    <v-text-field
                      v-model.number="multipliers.sofri_score_multipliers[351]"
                      type="number"
                      variant="outlined"
                      hide-details
                      density="compact"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score &lt; 350 Multiplier</label
                    >
                    <v-text-field
                      v-model.number="multipliers.sofri_score_multipliers[0]"
                      type="number"
                      variant="outlined"
                      hide-details
                      density="compact"
                    />
                  </div>
                </div>
              </div>

              <!-- Credit Score Multipliers -->
              <div>
                <h3 class="text-sm font-semibold mb-4">Credit Score Multipliers</h3>
                <div class="flex flex-col space-y-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score &gt; 760 Multiplier</label
                    >
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score 501–600 Multiplier</label
                    >
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score 451–500 Multiplier</label
                    >
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score 351–450 Multiplier</label
                    >
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Score &lt; 350 Multiplier</label
                    >
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                </div>
              </div>

              <!-- Income Multipliers -->
              <div>
                <h3 class="text-sm font-semibold mb-4 md:mt-0">Income Multipliers</h3>
                <div class="flex flex-col space-y-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700">200,000 and above</label>
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700">100,000 – 199,999</label>
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700">90,000 – 99,999</label>
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700">80,000 – 89,999</label>
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700">70,000 – 79,999</label>
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                </div>
              </div>

              <!-- Ontime Repayment Multipliers -->
              <div>
                <h3 class="text-sm font-semibold mb-4 mt-8 md:mt-0">
                  Ontime Repayment Multipliers
                </h3>
                <div class="flex flex-col space-y-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700">100%</label>
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700">&gt;= 80%</label>
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700">&gt;= 70%</label>
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700">&gt;= 60%</label>
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700">&gt;= 50%</label>
                    <v-text-field type="number" variant="outlined" hide-details density="compact" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="generalSettings">
          <div class="bg-white rounded p-4">
            <div class="flex justify-between mb-6 justify-end">
              <div class="space-x-2">
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  @click="() => runGeneralSettingsAction('apply')"
                  :loading="savingGeneralApply"
                  :disabled="savingGeneralApply"
                >
                  Apply Changes
                </v-btn>

                <v-btn
                  size="small"
                  color="success"
                  variant="flat"
                  @click="() => runGeneralSettingsAction('deploy')"
                  :loading="savingGeneralDeploy"
                  :disabled="!generalBatchId || savingGeneralDeploy"
                >
                  Deploy Changes
                </v-btn>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Side -->

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Base Loan Value (₦)</label
                >
                <v-text-field
                  type="number"
                  v-model.number="generalSettings.base_loan_value"
                  variant="outlined"
                  hide-details
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Minimum Loan Amount (₦)</label
                >
                <v-text-field
                  type="number"
                  v-model.number="generalSettings.minimum_loan_amount"
                  variant="outlined"
                  hide-details
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Maximum Loan Amount (₦)</label
                >
                <v-text-field
                  type="number"
                  v-model.number="generalSettings.maximum_loan_amount"
                  variant="outlined"
                  hide-details
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Minimum Age for Loans</label
                >
                <v-text-field
                  type="number"
                  v-model.number="generalSettings.minimum_loan_age"
                  variant="outlined"
                  hide-details
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Maximum Age for Loans</label
                >
                <v-text-field
                  type="number"
                  v-model.number="generalSettings.maximum_loan_age"
                  variant="outlined"
                  hide-details
                />
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
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'
import { ElMessage } from 'element-plus'

const savingApply = ref(false)
const savingDeploy = ref(false)
const loading = ref(false)

function showSnackbar(message, type = 'success') {
  ElMessage({
    message,
    type, // 'success', 'warning', 'info', 'error'
    duration: 4000,
    showClose: true
  })
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

const batchId = ref(null)

const runWeightAction = async (action = 'apply') => {
  if (action === 'apply') savingApply.value = true
  if (action === 'deploy') savingDeploy.value = true

  try {
    // Only adjust weights when action is "apply"
    if (action === 'apply') {
      const weightsPayload = {}
      sliders.value.forEach((slider) => {
        weightsPayload[slider.key] = slider.value
      })

      const adjustResponse = await api.post('/adjust-weights', {
        weights: weightsPayload
      })
      const adjustData = adjustResponse.data?.data
      batchId.value = adjustData?.batch_id
      console.log(`${action} adjust weights response:`, adjustResponse)
    }

    // For deploy, just use existing batchId
    if (!batchId.value) {
      showSnackbar(`Please apply changes before you deploy`, 'warning')
      return
    }

    const integrateResponse = await api.post('/integrate-batch', {
      batch_id: batchId.value,
      action
    })
    console.log(`${action} integrate response:`, integrateResponse)
    fetchWeights()
    showSnackbar(`Weights ${action}ed successfully`, 'success')
  } catch (error) {
    const errorMessage =
      error?.response?.data?.data?.error ||
      error?.response?.data?.message ||
      `An error occurred during ${action}`
    console.error(`${action} process failed:`, errorMessage)
    showSnackbar(errorMessage, 'error')
  } finally {
    if (action === 'apply') savingApply.value = false
    if (action === 'deploy') savingDeploy.value = false
  }
}

const savingScoreApply = ref(false)
const savingScoreDeploy = ref(false)

const scoreBatchId = ref(null)

const runScoreDataAction = async (action = 'apply') => {
  if (action === 'apply') savingScoreApply.value = true
  if (action === 'deploy') savingScoreDeploy.value = true

  try {
    if (action === 'apply') {
      const payload = { scores: {} }

      const keyMap = {
        'Client Type': 'client_type',
        Income: 'stated_income'
      }

      for (const key in scoreData) {
        const backendKey = keyMap[key]
        if (!backendKey || !scoreData[key]?.items) continue

        const values = scoreData[key].items

        if (scoreData[key].type === 'range') {
          payload.scores[backendKey] = values.map((item) => {
            const [min, max] = item.label.split('–').map((n) => parseFloat(n.trim()))
            return [min, max, item.score]
          })
        } else if (scoreData[key].type === 'map') {
          payload.scores[backendKey] = {}
          values.forEach((item) => {
            payload.scores[backendKey][item.label] = item.score
          })
        }
      }

      // Guard against empty payload
      if (!Object.keys(payload.scores).length) {
        showSnackbar('No valid score data to apply', 'warning')
        return
      }

      console.log('adjust-scores payload:', JSON.stringify(payload, null, 2))

      const res = await api.post('/adjust-scores', payload)
      scoreBatchId.value = res?.data?.data?.batch_id
    }

    // Deploy after applying
    if (!scoreBatchId.value) {
      showSnackbar('Please apply changes before you deploy', 'warning')
      return
    }

    const deployRes = await api.post('/integrate-batch', {
      batch_id: scoreBatchId.value,
      action
    })

    console.log(`${action} deploy response:`, deployRes)
    fetchScoreData()
    showSnackbar(`Score data ${action}ed successfully`, 'success')
  } catch (error) {
    const errorMessage =
      error?.response?.data?.data?.error ||
      error?.response?.data?.message ||
      `An error occurred during score ${action}`
    console.error(`${action} score process failed:`, errorMessage)
    showSnackbar(errorMessage, 'error')
  } finally {
    if (action === 'apply') savingScoreApply.value = false
    if (action === 'deploy') savingScoreDeploy.value = false
  }
}

const savingThresholdApply = ref(false)
const savingThresholdDeploy = ref(false)
const thresholdBatchId = ref(null)

const thresholds = reactive({
  minimum_loan_amount: null,
  maximum_loan_amount: null,
  minimum_loan_age: null,
  maximum_loan_age: null
})

const savingGeneralApply = ref(false)
const savingGeneralDeploy = ref(false)
const generalBatchId = ref(null)

const generalSettings = reactive({
  base_loan_value: null,
  minimum_loan_amount: null,
  maximum_loan_amount: null,
  minimum_loan_age: null,
  maximum_loan_age: null
})

const runGeneralSettingsAction = async (action = 'apply') => {
  if (action === 'apply') savingGeneralApply.value = true
  if (action === 'deploy') savingGeneralDeploy.value = true

  try {
    if (action === 'apply') {
      const response = await api.post('/adjust-thresholds', {
        thresholds: { ...generalSettings }
      })
      generalBatchId.value = response?.data?.data?.batch_id
    }

    if (!generalBatchId.value) {
      showSnackbar('Please apply changes before deploying', 'warning')
      return
    }

    const response = await api.post('/integrate-batch', {
      batch_id: generalBatchId.value,
      action
    })

    showSnackbar(`General Settings ${action}ed successfully`, 'success')
  } catch (error) {
    const errorMessage =
      error?.response?.data?.data?.error ||
      error?.response?.data?.message ||
      `An error occurred during general settings ${action}`
    showSnackbar(errorMessage, 'error')
  } finally {
    if (action === 'apply') savingGeneralApply.value = false
    if (action === 'deploy') savingGeneralDeploy.value = false
  }
}

const runThresholdAction = async (action = 'apply') => {
  if (action === 'apply') savingThresholdApply.value = true
  if (action === 'deploy') savingThresholdDeploy.value = true

  try {
    const payload = { thresholds: { ...thresholds } }

    if (action === 'apply') {
      const response = await api.post('/adjust-thresholds', payload)
      thresholdBatchId.value = response?.data?.data?.batch_id
    }

    if (!thresholdBatchId.value) {
      showSnackbar('Please apply changes before deploying', 'warning')
      return
    }

    const response = await api.post('/integrate-batch', {
      batch_id: thresholdBatchId.value,
      action
    })

    // Show different messages based on current tab
    const section = tab.value === 'generalSettings' ? 'General Settings' : 'Thresholds'
    showSnackbar(`${section} ${action}ed successfully`, 'success')
  } catch (error) {
    const errorMessage =
      error?.response?.data?.data?.error ||
      error?.response?.data?.message ||
      `An error occurred during thresholds ${action}`
    showSnackbar(errorMessage, 'error')
  } finally {
    if (action === 'apply') savingThresholdApply.value = false
    if (action === 'deploy') savingThresholdDeploy.value = false
  }
}

const multipliers = reactive({
  sofri_score_multipliers: {
    0: null,
    351: null,
    451: null,
    501: null,
    601: null,
    701: null
  },
  credit_score_multipliers: {
    0: null,
    351: null,
    451: null,
    501: null,
    601: null,
    701: null
  },
  income_multipliers: {
    70000: null,
    80000: null,
    90000: null,
    100000: null,
    200000: null
  },
  ontime_repayment_multipliers: {
    50: null,
    60: null,
    70: null,
    80: null,
    100: null
  }
})

const multiplierBatchId = ref(null)
const savingMultiplierApply = ref(false)
const savingMultiplierDeploy = ref(false)

const runMultiplierAction = async (action = 'apply') => {
  if (action === 'apply') savingMultiplierApply.value = true
  if (action === 'deploy') savingMultiplierDeploy.value = true

  try {
    if (action === 'apply') {
      const cleaned = {}

      Object.entries(multipliers.sofri_score_multipliers).forEach(([score, value]) => {
        cleaned[score] = value !== null && value !== '' ? value : '__UNSET__'
      })

      const payload = {
        multipliers: {
          sofri_score_multipliers: cleaned
        }
      }
      console.log('multipliers request payload:', payload)
      const response = await api.post('/adjust-multipliers', payload)
      multiplierBatchId.value = response?.data?.data?.batch_id
      console.log(`${action} multiplier response:`, response)
    }

    if (!multiplierBatchId.value) {
      showSnackbar('Please apply changes before deploying', 'warning')
      return
    }

    const deployRes = await api.post('/integrate-batch', {
      batch_id: multiplierBatchId.value,
      action
    })
    console.log(`${action} multiplier deploy response:`, deployRes)
    showSnackbar(`Multipliers ${action}ed successfully`, 'success')
  } catch (error) {
    const errorMessage =
      error?.response?.data?.data?.error ||
      error?.response?.data?.message ||
      `An error occurred during multiplier ${action}`

    showSnackbar(errorMessage, 'error')
  } finally {
    if (action === 'apply') savingMultiplierApply.value = false
    if (action === 'deploy') savingMultiplierDeploy.value = false
  }
}

const formatScoreData = (rawData) => {
  const result = {}

  for (const key in rawData) {
    const value = rawData[key]

    // Detect if it's a range array: [[min, max, score], ...]
    if (Array.isArray(value) && Array.isArray(value[0])) {
      result[formatKey(key)] = {
        type: 'range',
        items: value.map(([min, max, score]) => ({
          label: `${formatNumber(min)} – ${formatNumber(max)}`,
          min,
          max,
          score
        }))
      }
    }

    // Detect if it's a key-value object: { label: score }
    else if (typeof value === 'object' && value !== null) {
      result[formatKey(key)] = {
        type: 'map',
        items: Object.entries(value).map(([label, score]) => ({
          label,
          score
        }))
      }
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
.v-slider {
  --v-slider-track-size: 4px;
  --v-slider-thumb-size: 12px;
}

.v-tab {
  text-transform: none;
}
.v-btn {
  text-transform: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
:deep(.v-tab__slider) {
  height: 4px !important; /* Adjust thickness */
  background-color: #1f5aa3 !important; /* Change color if needed */
}
</style>
