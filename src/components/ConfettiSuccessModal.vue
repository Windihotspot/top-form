<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-xl text-center relative">
      <!-- Confetti canvas -->
      <canvas ref="confettiCanvas" class="absolute top-0 left-0 w-full h-full pointer-events-none z-0"></canvas>

      <!-- Success content -->
      <div class="relative z-10">
        <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
        <h2 class="text-xl font-bold mb-2">Success!</h2>
        <img src="../assets/success-upload.png" alt="">
        <p class="text-gray-600">Your bank statement has been added successfully.</p>

        <v-btn
          color="#1f5aa3"
          variant="plain"
          @click="$emit('close')"
          class="custom-btn text-white w-full m-4"
        >
          Return Home
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, ref } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps({ visible: Boolean })

const confettiCanvas = ref(null)

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // Wait for canvas to mount, then launch confetti
      setTimeout(() => {
        if (confettiCanvas.value) {
          const myConfetti = confetti.create(confettiCanvas.value, { resize: true, useWorker: true })
          const duration = 2 * 1000
          const end = Date.now() + duration

          const colors = ['#1f5aa3', '#00b894', '#ffeaa7', '#fab1a0']

          ;(function frame() {
            myConfetti({
              particleCount: 4,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors
            })
            myConfetti({
              particleCount: 4,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors
            })

            if (Date.now() < end) {
              requestAnimationFrame(frame)
            }
          })()
        }
      }, 100)
    }
  }
)
</script>

<style scoped>
.custom-btn {
  background-color: #1f5aa3;
  text-transform: none;
}
</style>
