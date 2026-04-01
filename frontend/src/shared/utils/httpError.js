export function normalizeApiError(error) {
  if (!error) {
    return { message: 'Unknown error', status: null, details: null }
  }

  const status = error.response?.status || null
  const details = error.response?.data || null
  const message =
    details?.detail || details?.message || error.message || 'Request failed'

  return { message, status, details }
}

export function isUnauthorizedError(error) {
  return error?.response?.status === 401
}
