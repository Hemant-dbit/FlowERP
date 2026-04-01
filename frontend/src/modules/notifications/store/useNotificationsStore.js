import { create } from 'zustand';

import {
  deleteNotificationApi,
  getNotificationsApi,
  getUnreadCountApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from '../api/notificationsApi';

const initialState = {
  loading: false,
  saving: false,
  notifications: [],
  unreadCount: 0,
  error: null,
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data === 'string') return data;

  return error?.message || fallback;
}

const useNotificationsStore = create((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const notifications = await getNotificationsApi();
      set({
        loading: false,
        notifications: Array.isArray(notifications) ? notifications : [],
      });
    } catch (error) {
      set({
        loading: false,
        notifications: [],
        error: getErrorMessage(error, 'Failed to load notifications'),
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = await getUnreadCountApi();
      set({ unreadCount: Number(data?.unread_count || 0) });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to load unread count') });
    }
  },

  markRead: async (notificationId) => {
    set({ saving: true, error: null });
    try {
      await markNotificationReadApi(notificationId);

      set((state) => {
        const next = state.notifications.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item
        );
        const unreadCount = next.filter((item) => !item.is_read).length;

        return {
          saving: false,
          notifications: next,
          unreadCount,
        };
      });

      return { ok: true };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to mark notification as read') });
      return { ok: false, error };
    }
  },

  markAllRead: async () => {
    set({ saving: true, error: null });
    try {
      await markAllNotificationsReadApi();
      set((state) => ({
        saving: false,
        notifications: state.notifications.map((item) => ({ ...item, is_read: true })),
        unreadCount: 0,
      }));
      return { ok: true };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to mark all as read') });
      return { ok: false, error };
    }
  },

  removeNotification: async (notificationId) => {
    set({ saving: true, error: null });
    try {
      await deleteNotificationApi(notificationId);
      set((state) => {
        const next = state.notifications.filter((item) => item.id !== notificationId);
        const unreadCount = next.filter((item) => !item.is_read).length;

        return {
          saving: false,
          notifications: next,
          unreadCount,
        };
      });
      return { ok: true };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to delete notification') });
      return { ok: false, error };
    }
  },

  startPolling: (intervalMs = 30000) => {
    const { stopPolling, fetchUnreadCount } = get();
    stopPolling();

    fetchUnreadCount();
    const poller = setInterval(() => {
      fetchUnreadCount();
    }, intervalMs);

    set({ _poller: poller });
  },

  stopPolling: () => {
    const poller = get()._poller;
    if (poller) {
      clearInterval(poller);
    }
    set({ _poller: null });
  },
}));

export default useNotificationsStore;
