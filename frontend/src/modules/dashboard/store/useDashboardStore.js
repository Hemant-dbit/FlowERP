import { create } from 'zustand'

import {
  getMyDashboardApi,
  getOverviewReportApi,
  getProjectProgressApi,
  getTasksByStatusApi,
} from '../api/dashboardApi'
import { ROLES } from '../../../shared/constants/roles'

const initialState = {
  loading: false,
  error: null,
  myDashboard: null,
  overview: null,
  tasksByStatus: null,
  projectProgress: null,
  fetchMeta: {
    role: null,
    fetchedAt: null,
  },
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data

  if (typeof data?.detail === 'string') {
    return data.detail
  }

  if (typeof data === 'string') {
    return data
  }

  return error?.message || fallback
}

async function safeCall(callback) {
  try {
    const data = await callback()
    return { ok: true, data }
  } catch (error) {
    return { ok: false, error }
  }
}

const useDashboardStore = create((set) => ({
  ...initialState,

  resetDashboard: () => set({ ...initialState }),

  fetchDashboardData: async (role) => {
    set({ loading: true, error: null })

    const isManagerLike = role === ROLES.ADMIN || role === ROLES.MANAGER

    const [myDashboardResult, tasksByStatusResult, overviewResult, projectProgressResult] =
      await Promise.all([
        safeCall(() => getMyDashboardApi()),
        safeCall(() => getTasksByStatusApi()),
        isManagerLike ? safeCall(() => getOverviewReportApi()) : Promise.resolve(null),
        isManagerLike ? safeCall(() => getProjectProgressApi()) : Promise.resolve(null),
      ])

    const errors = []

    if (!myDashboardResult.ok) {
      errors.push(getErrorMessage(myDashboardResult.error, 'Failed to load dashboard'))
    }

    if (tasksByStatusResult && !tasksByStatusResult.ok) {
      errors.push(getErrorMessage(tasksByStatusResult.error, 'Failed to load task status report'))
    }

    if (overviewResult && !overviewResult.ok) {
      errors.push(getErrorMessage(overviewResult.error, 'Failed to load overview report'))
    }

    if (projectProgressResult && !projectProgressResult.ok) {
      errors.push(getErrorMessage(projectProgressResult.error, 'Failed to load project progress report'))
    }

    set({
      loading: false,
      error: errors.length ? errors[0] : null,
      myDashboard: myDashboardResult.ok ? myDashboardResult.data : null,
      tasksByStatus: tasksByStatusResult?.ok ? tasksByStatusResult.data : null,
      overview: overviewResult?.ok ? overviewResult.data : null,
      projectProgress: projectProgressResult?.ok ? projectProgressResult.data : null,
      fetchMeta: {
        role,
        fetchedAt: new Date().toISOString(),
      },
    })
  },
}))

export default useDashboardStore
