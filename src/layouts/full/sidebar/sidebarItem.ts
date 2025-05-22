export default [
  {
    title: 'Dashboard',
    icon: 'fa-solid fa-chart-line', // Better fit for analytics/overview
    path: '/dashboard'
  },
  {
    title: 'Job List',
    icon: 'fa-solid fa-list-check', // Represents a checklist or task list
    path: '/wallet' // Consider renaming this path if unrelated to finance
  },
  {
    title: 'Business Logic',
    icon: 'fa-solid fa-diagram-project', // Represents structured processes/workflows
    path: '/settings'
  },
  {
    title: 'Logs',
    icon: 'fa-solid fa-file-lines', // Represents textual logs or documents
    path: '/logs' // Avoid reusing the same path as above
  }
]
