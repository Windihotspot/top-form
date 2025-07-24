<template>
  <MainLayout>
    <v-container class="py-8 px-4">
      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
        size="48"
        class="mx-auto my-10"
      />
      <div v-else>
        <!-- Profile Header -->
        <div class="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div class="flex flex-col items-center m-4">
            <v-avatar size="120">
              <v-img :src="admin.avatar_url || defaultAvatar" />
            </v-avatar>
          </div>

          <!-- Contact Form -->
          <div class="w-full md:w-3/4 p-6">
            <div class="text-lg font-semibold mb-4">Contact Details</div>

            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  variant="outlined"
                  color="#15803d"
                  v-model="admin.first_name"
                  label="First Name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  variant="outlined"
                  color="#15803d"
                  v-model="admin.last_name"
                  label="Last Name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  variant="outlined"
                  color="#15803d"
                  v-model="admin.phone"
                  label="Phone Number"
                  prefix="+234"
                  type="tel"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  variant="outlined"
                  color="#15803d"
                  v-model="admin.timezone"
                  :items="timezones"
                  label="Timezone"
                />
              </v-col>
            </v-row>

            <v-btn :loading="saving" color="primary" class="m-2" @click="saveChanges">
              Save Changes
            </v-btn>
          </div>
        </div>

        <!-- Account Overview -->
        <div class="mt-10 p-6">
          <v-table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Password</th>
                <th>Status</th>

                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ admin.email }}</td>
                <td>********</td>
                <td>
                  <v-chip :color="admin.status === 'active' ? 'success' : 'error'" dark>
                    {{ admin.status === 'active' ? 'Verified' : 'Unverified' }}
                  </v-chip>
                </td>

                <td>
                  <v-btn icon variant="text">
                    <i class="fas fa-ellipsis-v text-gray-600"></i>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-btn variant="outlined" class="m-4"> + Add New Email </v-btn>
        </div>
      </div>
    </v-container>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import api from '@/services/api'
const loading = ref(false)
const saving = ref(false)

const admin = ref({})

const timezones = [
  'Africa/Lagos',
  'Europe/London',
  'Asia/Dhaka (GMT +6)',
  'America/New_York',
  'Asia/Kolkata'
]

const defaultAvatar = 'https://cdn.pixabay.com/photo/2020/06/29/20/31/man-5354308_640.png'

const saveChanges = async () => {
  saving.value = true
  try {
    const response = await api.put('/admins/me', {
      first_name: admin.value.first_name,
      last_name: admin.value.last_name,
      phone: admin.value.phone,
      avatar_url: admin.value.avatar_url,
      timezone: admin.value.timezone,
      gender: admin.value.gender,
      date_of_birth: admin.value.date_of_birth
    })

    ElNotification({
      title: 'Success',
      message: 'Profile updated successfully!',
      type: 'success'
    })

    admin.value = response.data.data
  } catch (error) {
    console.error('Failed to update profile:', error)
    ElNotification({
      title: 'Error',
      message: error.response?.data?.message || 'Something went wrong',
      type: 'error'
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const response = await api.get('/admins/me')
    admin.value = response.data.data
    console.log("admin profile:", admin.value)
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Optional Tailwind enhancements */
</style>
