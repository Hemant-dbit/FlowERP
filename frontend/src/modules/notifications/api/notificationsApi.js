import { apiDelete, apiGet, apiPost } from '../../../services/api'
import ENDPOINTS from '../../../services/endpoints'

export function getNotificationsApi() {
  return apiGet(ENDPOINTS.notifications.list)
}

export function getUnreadCountApi() {
  return apiGet(ENDPOINTS.notifications.unreadCount)
}

export function markNotificationReadApi(notificationId) {
  return apiPost(ENDPOINTS.notifications.markRead(notificationId))
}

export function markAllNotificationsReadApi() {
  return apiPost(ENDPOINTS.notifications.markAllRead)
}

export function deleteNotificationApi(notificationId) {
  return apiDelete(ENDPOINTS.notifications.delete(notificationId))
}
