<template>
  <div class="p-4">
    <vue-cal
      style="height: 700px"
      :events="events"
      default-view="week"
      time="24"
      hide-title-bar
      active-view="week"
      :on-event-click="onEventClick"
    />
  </div>
</template>

<script setup>
import 'vue-cal/dist/vuecal.css'
import VueCal from 'vue-cal'

const events = [
  {
    start: '2025-08-10 08:00',
    end: '2025-08-10 09:30',
    title: 'Computer Science Class - JSS1',
    content: 'Lab 2',
  },
  {
    start: '2025-08-11 09:00',
    end: '2025-08-11 11:00',
    title: 'Math Test - SS2',
  },
  {
    start: '2025-08-12 13:00',
    end: '2025-08-12 14:00',
    title: 'Staff Meeting',
  },
  {
    start: '2025-08-14',
    end: '2025-08-14',
    title: 'Interhouse Sports',
    content: 'All day event',
  }
]

function onEventClick(event) {
  alert(`Event: ${event.title}`)
}
</script>
