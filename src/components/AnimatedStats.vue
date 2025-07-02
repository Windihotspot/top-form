<script setup>
import { ref, onMounted } from 'vue'
import { CountUp } from 'countup.js'

const props = defineProps({
  label: String,
  value: Number,
  colorClass: String,
  percentage: Number
})

const el = ref(null)
const visible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !visible.value) {
      visible.value = true
      const counter = new CountUp(el.value, props.value)
      counter.start()
    }
  }, { threshold: 0.6 })

  if (el.value) observer.observe(el.value)
})
</script>

<template>
  <div :class="`p-4 rounded-lg shadow ${colorClass} animate-slide-in`">
    <p class="text-sm text-gray-600">{{ label }}</p>
    <div class="flex items-center justify-between mb-8">
      <p ref="el" class="text-2xl font-bold">0</p>
      <div class="flex items-center space-x-1 text-sm font-medium">
       <span>{{ percentage + '%' }}</span>

        <i class="fas fa-arrow-up-right"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideInTop {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slideInTop 0.8s ease forwards;
}
</style>
