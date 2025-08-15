import '@/scss/style.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import 'aos/dist/aos.css'
import AOS from 'aos'

// Import Element Plus and its styles
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './assets/fonts.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import VueApexCharts from 'vue3-apexcharts'
import '@fortawesome/fontawesome-free/css/all.css'
import { fa } from 'vuetify/iconsets/fa'
import { useUserStore } from '@/stores/user'

let vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,

    sets: { mdi, fa }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VueApexCharts)
app.use(ElementPlus)

// 🔥 Load user data from localStorage into Pinia store
const userStore = useUserStore()

const savedUser = localStorage.getItem('user')
const savedRole = localStorage.getItem('role')
const savedPermissions = localStorage.getItem('permissions')
const savedToken = localStorage.getItem('token')

if (savedUser && savedRole && savedPermissions) {
  userStore.user = JSON.parse(savedUser)
  userStore.role = JSON.parse(savedRole)
  userStore.permissions = JSON.parse(savedPermissions)
  userStore.token = savedToken || ''
}

const urlParams = new URLSearchParams(window.location.search)
const redirectPath = urlParams.get('redirect')

if (redirectPath) {
  router.push(redirectPath).catch(() => {})
}
app.mount('#app')

AOS.init()
