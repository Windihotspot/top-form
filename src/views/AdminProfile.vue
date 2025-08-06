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
                <el-button icon="el-icon-upload" :loading="loading">Upload</el-button>
              </el-upload>

              <div v-if="isUploading" class="text-xs mt-1 text-gray-500">Uploading...</div>

              <!-- Delete -->
              <el-button
                icon="el-icon-delete"
                type="danger"
                :loading="loading"
                @click="deleteAvatar"
                :disabled="!admin.avatar_url"
              >
                Delete
              </el-button>
            </div>
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
import { supabase } from '@/supabase.js'
import MainLayout from '@/layouts/full/MainLayout.vue'
import api from '@/services/api'
const loading = ref(false)
const saving = ref(false)
import { useAuthStore } from '@/stores/auth' // adjust path if needed
import { ElNotification, ElMessage } from 'element-plus'

const auth = useAuthStore()

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
const fetchadminProfile = async () => {
  loading.value = true
  try {
    const response = await api.get('/admins/me')
    admin.value = {
      ...response.data.data,
      avatar_url: response.data.data.avatar_url
        ? `${response.data.data.avatar_url}?t=${Date.now()}`
        : null
    }

    console.log('admin profile:', admin.value)
  } catch (error) {
    console.error('Error fetching profile:', error)
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

    fetchadminProfile()
  } catch (err) {
    console.error('❌ Upload failed:', err)
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
    loading.value = true

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
    ElMessage.success('Avatar removed.')
  } catch (error) {
    console.error(error)
    ElMessage.error('Error deleting avatar')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  fetchadminProfile()
})
</script>

<style scoped>
/* Optional Tailwind enhancements */
</style>
