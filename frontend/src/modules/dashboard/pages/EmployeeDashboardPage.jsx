import { useEffect } from 'react'

import DashboardContent from '../components/DashboardContent'
import useDashboardStore from '../store/useDashboardStore'
import { ROLES } from '../../../shared/constants/roles'

export default function EmployeeDashboardPage() {
  const { fetchDashboardData } = useDashboardStore()

  useEffect(() => {
    fetchDashboardData(ROLES.EMPLOYEE)
  }, [fetchDashboardData])

  return <DashboardContent title="Employee Dashboard" subtitle="Your personal task and project summary" />
}
