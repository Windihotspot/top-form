<template>
  <div
    class="flex items-center p-4 bg-white shadow rounded-lg hover:scale-105 transition-transform duration-300"
  >
    <div :class="iconBgClass" class="p-3 text-xl">
      <i :class="iconClass"></i>
    </div>
    <div class="ml-4">
      <p class="text-gray-500 text-sm">{{ title }}</p>
      <p class="text-xl font-normal">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  iconClass: String,
  iconBgClass: String,
  title: String,
  value: [String, Number]
})
</script>
