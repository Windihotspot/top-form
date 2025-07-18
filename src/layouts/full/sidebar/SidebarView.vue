<script setup>

</script>

<template>
  
</template>

<style scoped>
.side-bar {
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
}

.logout-btn:hover {
  background-color: #ffecec;
}

.logo {
  width: 50%;
}
.menu-item {
  font-size: 12px;
  text-transform: none;
  color: #1e1e1e;
}

.custom-btn:hover {
  background-color: #e8f0fe;
}

.custom-btn {
  text-align: left;
  justify-content: flex-start;
  transition: background-color 0.2s ease;
}
.custom-btn .v-icon {
  margin-right: 8px;
  color: #1e1e1e;
}
.custom-btn .menu-item {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Helvetica,
    Arial,
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji';
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 28px;
}
.custom-link {
  text-decoration: none; /* Remove underline from Link */
}

.custom-active {
  color: #1f5aa3 !important; /* Active state color */
  background-color: rgba(0, 0, 255, 0.1); /* Light blue background */
 border-radius: 12px;
  position: relative;
  overflow: visible;
}

.custom-active .menu-item {
  color: #1f5aa3 !important;
}

.custom-active .v-icon {
  color: #1f5aa3 !important;
}
.active-bar {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 4px;
  height: 40px; /* Adjust to match your button height */
  background-color: #1f5aa3;
  border-radius: 8px;
}
.custom-active::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 12px;
  bottom: 12px;
  width: 4px;
  background-color: #1f5aa3; /* Blue vertical bar */
  border-radius: 4px;
}
::v-deep(.custom-active::after) {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  right: -4px;
  width: 4px;
  background-color: #1f5aa3;
  border-radius: 4px;
}

</style>
