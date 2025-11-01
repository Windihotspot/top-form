<template>
  <MainLayout>
    <v-container class="py-8 px-4">
      <div v-if="loading" class="flex items-center justify-center my-auto">
        <v-progress-circular indeterminate color="success" size="48" />
      </div>

      <div v-else>
        <!-- Profile Header -->
        <div class="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div class="flex flex-col items-center space-y-4">
            <div class="flex items-center space-x-3">
              <!-- Upload -->
              <el-upload
                class="avatar-uploader"
                :show-file-list="false"
                :before-upload="uploadAvatar"
              >
                <v-avatar size="120">
                  <v-img :src="admin.avatar_url || defaultAvatar" :key="admin.avatar_url" />
                </v-avatar>

                <!-- Upload Icon -->
                <v-btn icon variant="text" color="success" :loading="loading" class="ml-2">
                  <v-icon>mdi-upload</v-icon>
                </v-btn>
                <!-- Delete Icon -->
                <v-btn
                  icon
                  variant="text"
                  color="red"
                  :loading="loading"
                  @click.stop="deleteAvatar"
                  @click="deleteAvatar"
                  :disabled="!admin.avatar_url"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </el-upload>
            </div>

            <div v-if="isUploading" class="text-xs mt-1 text-green-500">Uploading...</div>
          </div>

          <!-- Contact Form -->
          <div class="w-full md:w-3/4 p-6">
            <div class="text-lg font-semibold mb-4">Contact Details</div>

            <v-text-field
              variant="outlined"
              color="#214ec8"
              v-model="admin.fullname"
              label="Full Name"
            />

            <v-text-field
              variant="outlined"
              color="#214ec8"
              v-model="admin.email"
              label="Email address"
            />

            <div class="grid grid-cols-2 gap-4">
              <!-- Phone Number with flag -->
              <v-text-field
                variant="outlined"
                color="#214ec8"
                v-model="admin.phone"
                label="Phone Number"
                type="tel"
              >
                <!-- Prepend slot for flag + code -->
                <template #prepend-inner>
                  <img
                    src="https://flagcdn.com/w20/ng.png"
                    alt="Nigeria"
                    class="w-6 h-4 rounded-sm mr-2"
                  />
                  <span class="text-gray-700 mr-6">+234</span>
                </template>
              </v-text-field>

              <!-- Created Date (disabled) -->
              <v-text-field
                variant="outlined"
                color="success"
                v-model="admin.created_at"
                label="Created Date"
                disabled
              />
            </div>

            <v-text-field
              variant="outlined"
              color="#214ec8"
              label="Password"
              v-model="admin.password"
              type="password"
              autocomplete="new-password"
            />

            <v-progress-linear
              :value="passwordStrengthPercent"
              :color="passwordStrengthColor"
              height="6"
              class="mb-1"
            />

            <p class="text-sm font-medium" :class="passwordStrengthClass">
              {{ passwordStrengthLabel }}
            </p>

            <v-btn :loading="saving" color="success" class="m-2" @click="saveChanges">
              Save Changes
            </v-btn>
          </div>
        </div>

        <!-- Account Overview -->
        <div class="mt-10">
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase.js'
import MainLayout from '@/layouts/full/MainLayout.vue'
import api from '@/services/api'
const loading = ref(false)
const saving = ref(false)
import { useAuthStore } from '@/stores/auth' // adjust path if needed
import { ElNotification, ElMessage } from 'element-plus'

const auth = useAuthStore()

// Password rules
const passwordRules = [
  (v) => !!v || 'Password is required',
  (v) => v.length >= 6 || 'Minimum 6 characters',
  (v) => /[A-Z]/.test(v) || 'At least one uppercase letter',
  (v) => /[0-9]/.test(v) || 'At least one number'
]

// Password strength %
const passwordStrengthPercent = computed(() => {
  const p = admin.password || '' // safe fallback
  let score = 0
  if (p.length >= 6) score += 30
  if (/[A-Z]/.test(p)) score += 30
  if (/[0-9]/.test(p)) score += 20
  if (/[^a-zA-Z0-9]/.test(p)) score += 20
  return score
})

// Progress bar color
const passwordStrengthColor = computed(() => {
  const val = passwordStrengthPercent.value
  if (val < 40) return 'red'
  if (val < 70) return 'orange'
  return 'green'
})

// Label & text color
const passwordStrengthLabel = computed(() => {
  const val = passwordStrengthPercent.value
  if (val === 0) return ''
  if (val < 40) return 'Weak'
  if (val < 70) return 'Medium'
  return 'Strong'
})

const passwordStrengthClass = computed(() => {
  const val = passwordStrengthPercent.value
  if (val < 40) return 'text-red-600'
  if (val < 70) return 'text-orange-600'
  return 'text-green-600'
})

const storeAdmin = auth.admin
console.log('admin from store:', storeAdmin)
const storeUser = auth.user
console.log('user from store:', storeUser)

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
    const { error } = await supabase
      .from('admins')
      .update({
        first_name: admin.value.first_name,
        last_name: admin.value.last_name,
        phone: admin.value.phone,
        avatar_url: admin.value.avatar_url,
        timezone: admin.value.timezone,
        gender: admin.value.gender,
        date_of_birth: admin.value.date_of_birth
      })
      .eq('id', auth.admin.id)

    if (error) throw error

    ElNotification({
      title: 'Success',
      message: 'Profile updated successfully!',
      type: 'success'
    })
  } catch (error) {
    console.error('Failed to update profile:', error.message)
    ElNotification({
      title: 'Error',
      message: error.message || 'Something went wrong',
      type: 'error'
    })
  } finally {
    saving.value = false
  }
}

const fetchAdminProfile = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', auth.admin.id) // use the id from your store
      .single()

    if (error) throw error

    admin.value = {
      ...data,
      avatar_url: data.avatar_url ? `${data.avatar_url}?t=${Date.now()}` : null
    }

    console.log('admin profile:', admin.value)
  } catch (error) {
    console.error('Error fetching profile:', error.message)
  } finally {
    loading.value = false
  }
}

// Upload and Update Avatar
const isUploading = ref(false)

const uploadAvatar = async (file) => {
  if (!file || !admin.value?.id) {
    ElNotification({
      title: 'Upload Failed',
      message: 'Missing file or admin ID.',
      type: 'error'
    })
    return
  }

  isUploading.value = true

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${admin.value.id}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('admin-avatars')
      .upload(filePath, file.raw || file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage.from('admin-avatars').getPublicUrl(filePath)

    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`
    admin.value.avatar_url = publicUrl
    auth.admin.avatar_url = publicUrl

    const { error: dbError } = await supabase
      .from('admins')
      .update({ avatar_url: publicUrl })
      .eq('id', admin.value.id)

    if (dbError) throw dbError

    admin.value.avatar_url = `${publicUrl}?t=${Date.now()}`
    auth.admin.avatar_url = admin.value.avatar_url // update Pinia store if needed

    ElNotification({
      title: 'Profile Updated',
      message: 'Avatar uploaded successfully.',
      type: 'success',
      duration: 4000
    })
    auth.updateAvatar(publicUrl)
  } catch (err) {
    console.log('❌ Upload failed:', err)
    ElNotification({
      title: 'Upload Failed',
      message: err.message || 'Avatar upload failed',
      type: 'error'
    })
  } finally {
    isUploading.value = false
  }
}

// Delete Avatar
const deleteAvatar = async () => {
  try {
    // Extract file path from URL
    const filePath = admin.value.avatar_url?.split('/').slice(-2).join('/')

    if (filePath) {
      await supabase.storage.from('admin-avatars').remove([filePath])
    }

    await supabase.rpc('manage_admin_avatar', {
      p_admin_id: admin.value.id,
      p_avatar_url: null,
      p_action: 'delete'
    })

    // Update both local and global store
    auth.avatarRefreshKey = Date.now()
    admin.value.avatar_url = null
    auth.admin.avatar_url = null

    // close "deleting..." and show success
    // show success notification
    ElNotification({
      title: 'Profile avatar updated',
      message: 'Avatar removed.',
      type: 'success',
      position: 'top-right',
      duration: 3000
    })
  } catch (error) {
    console.error(error)
    ElMessage.error('Error deleting avatar')
  }
}

onMounted(async () => {
  fetchAdminProfile()
})
</script>

<style scoped>
.v-btn {
  text-transform: none;
}
/* Optional Tailwind enhancements */
</style>
