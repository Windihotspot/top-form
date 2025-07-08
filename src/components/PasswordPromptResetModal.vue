<template>
  <el-dialog
    v-model="visible"
    title="Password Reset Required"
    :close-on-click-modal="false"
    :show-close="false"
    width="400px"
    center
  >
    <p>For security reasons, please reset your password to continue using your account.</p>
    <template #footer>
      <el-button type="primary" @click="goToReset">Reset Password</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const router = useRouter()

watch(() => props.modelValue, val => {
  visible.value = val
})

watch(visible, val => {
  emit('update:modelValue', val)
})

const goToReset = () => {
  router.push('/updatepassword') // or open a password reset form modal
}
</script>
