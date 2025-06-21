const sidebarItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
        icon: 'fa-solid fa-chart-area', 
    permission: null
  },
  {
    title: 'Jobs',
    path: '/joblist',
    icon: 'fas fa-briefcase',
    permission: 'view_jobs'
  },
  {
    title: 'Business Logic',
    path: '/business-logic',
    icon: 'fas fa-cogs',
    permission: 'view_logic'
  },
  {
    title: 'Logs',
    path: '/logs',
    icon: 'fas fa-file-alt',
    permission: 'view_logs'
  }
]

export default sidebarItems
