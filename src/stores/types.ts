export interface Role {
  name: string
  permissions: string[]
}

export interface User {
  id: number
  name: string
  email: string
  role: Role
  // Add other fields as needed
}

export interface JobByLocation {
  state: string
  count: number
}

export interface JobByOS {
  user_agent: string
  count: number
}

export interface MonthlyJob {
  month: number
  count: number
}

export interface RiskLevelData {
  risk_level: string
  count: number
}

export interface DashboardStats {
  total_accepted_jobs: number
  total_rejected_jobs: number
  total_failed_jobs: number
  total_jobs: number
  jobs_by_location: JobByLocation[]
  jobs_by_os: JobByOS[]
  accepted_jobs_by_month: MonthlyJob[]
  rejected_jobs_by_months: MonthlyJob[]
  percentage_increase_accepted_job: number
  percentage_increase_rejected_job: number
  percentage_increase_failed_job: number
  accepted_credit_jobs_by_risk_level: RiskLevelData[]
}

export interface LoginResponseData {
  token: string
  user: User
  // everything in DashboardStats is also in the login response
  total_accepted_jobs: number
  total_rejected_jobs: number
  total_failed_jobs: number
  total_jobs: number
  jobs_by_location: JobByLocation[]
  jobs_by_os: JobByOS[]
  accepted_jobs_by_month: MonthlyJob[]
  rejected_jobs_by_months: MonthlyJob[]
  percentage_increase_accepted_job: number
  percentage_increase_rejected_job: number
  percentage_increase_failed_job: number
  accepted_credit_jobs_by_risk_level: RiskLevelData[]
}
