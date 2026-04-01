import axios from 'axios'

import { emitAuthExpired } from '../app/eventBus'
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../shared/constants/api'
import ENDPOINTS from './endpoints'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../shared/utils/tokenStorage'

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: REQUEST_TIMEOUT_MS,
	headers: {
		'Content-Type': 'application/json',
	},
})

let refreshInFlight = null

function isAuthRequest(url = '') {
	return [ENDPOINTS.auth.login, ENDPOINTS.auth.register, ENDPOINTS.auth.refresh].some((path) =>
		url.includes(path)
	)
}

async function refreshAccessToken() {
	const refresh = getRefreshToken()

	if (!refresh) {
		throw new Error('Missing refresh token')
	}

	const response = await axios.post(
		`${API_BASE_URL}${ENDPOINTS.auth.refresh}`,
		{ refresh },
		{
			headers: { 'Content-Type': 'application/json' },
			timeout: REQUEST_TIMEOUT_MS,
		}
	)

	const nextAccessToken = response.data?.access

	if (!nextAccessToken) {
		throw new Error('Refresh response missing access token')
	}

	setTokens({ access: nextAccessToken })
	return nextAccessToken
}

apiClient.interceptors.request.use(
	(config) => {
		const token = getAccessToken()

		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}

		return config
	},
	(error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error?.config
		const is401 = error?.response?.status === 401
		const requestUrl = originalRequest?.url || ''
		const skipRefresh = isAuthRequest(requestUrl)

		if (is401 && originalRequest && !originalRequest._retry && !skipRefresh) {
			originalRequest._retry = true

			try {
				if (!refreshInFlight) {
					refreshInFlight = refreshAccessToken().finally(() => {
						refreshInFlight = null
					})
				}

				const newAccessToken = await refreshInFlight
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
				return apiClient(originalRequest)
			} catch (refreshError) {
				clearTokens()
				emitAuthExpired()
				return Promise.reject(error)
			}
		}

		return Promise.reject(error)
	}
)

export async function apiGet(url, config = {}) {
	const response = await apiClient.get(url, config)
	return response.data
}

export async function apiPost(url, data = {}, config = {}) {
	const response = await apiClient.post(url, data, config)
	return response.data
}

export async function apiPut(url, data = {}, config = {}) {
	const response = await apiClient.put(url, data, config)
	return response.data
}

export async function apiPatch(url, data = {}, config = {}) {
	const response = await apiClient.patch(url, data, config)
	return response.data
}

export async function apiDelete(url, config = {}) {
	const response = await apiClient.delete(url, config)
	return response.data
}

export default apiClient
