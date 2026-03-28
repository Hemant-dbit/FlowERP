import { create } from 'zustand'

import { currentUserApi, loginApi, logoutApi, registerApi } from '../api/authApi'
import {
  clearTokens,
  getRefreshToken,
  hasAccessToken,
  setTokens,
} from '../../../shared/utils/tokenStorage'

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,
  error: null,
}

function getApiErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail
  }

  if (data && typeof data === 'object') {
    const firstKey = Object.keys(data)[0]
    const firstValue = data[firstKey]

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return `${firstKey}: ${firstValue[0]}`
    }

    if (typeof firstValue === 'string') {
      return `${firstKey}: ${firstValue}`
    }
  }

  return error?.message || fallbackMessage
}

const useAuthStore = create((set, get) => ({
  ...initialState,

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  fetchCurrentUser: async () => {
    set({ loading: true, error: null })
    try {
      const user = await currentUserApi()
      set({
        user,
        role: user?.role || null,
        isAuthenticated: true,
        loading: false,
      })
      return user
    } catch (error) {
      clearTokens()
      set({
        ...initialState,
        initialized: true,
        loading: false,
        error: getApiErrorMessage(error, 'Failed to fetch user'),
      })
      return null
    }
  },

  initializeAuth: async () => {
    if (!hasAccessToken()) {
      set({ initialized: true })
      return
    }

    await get().fetchCurrentUser()
    set({ initialized: true })
  },

  login: async (payload) => {
    set({ loading: true, error: null })
    try {
      const tokens = await loginApi(payload)
      setTokens(tokens)
      const user = await get().fetchCurrentUser()
      set({ loading: false, initialized: true })
      return { ok: true, user }
    } catch (error) {
      clearTokens()
      set({
        loading: false,
        initialized: true,
        isAuthenticated: false,
        error: getApiErrorMessage(error, 'Login failed'),
      })
      return { ok: false, error }
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null })
    try {
      const result = await registerApi(payload)
      set({ loading: false })
      return { ok: true, data: result }
    } catch (error) {
      set({
        loading: false,
        error: getApiErrorMessage(error, 'Registration failed'),
      })
      return { ok: false, error }
    }
  },

  logout: async () => {
    const refresh = getRefreshToken()

    try {
      if (refresh) {
        await logoutApi({ refresh })
      }
    } catch (error) {
      // Best-effort logout call; local cleanup must still happen.
    } finally {
      clearTokens()
      set({ ...initialState, initialized: true })
    }
  },

  forceLogout: () => {
    clearTokens()
    set({ ...initialState, initialized: true })
  },
}))

export default useAuthStore
