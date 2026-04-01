import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import useNotificationsStore from '../store/useNotificationsStore';

import useAuthStore from '../../auth/store/useAuthStore';
import { DASHBOARD_PATH_BY_ROLE, ROLES } from '../../../shared/constants/roles';

export default function NotificationsPage() {
  const {
    loading,
    saving,
    error,
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markRead,
    markAllRead,
    removeNotification,
    clearError,
    startPolling,
    stopPolling,
  } = useNotificationsStore();
  const { role } = useAuthStore();
  const dashboardPath = DASHBOARD_PATH_BY_ROLE[role] || DASHBOARD_PATH_BY_ROLE[ROLES.EMPLOYEE];

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    startPolling(30000);

    return () => {
      stopPolling();
    };
  }, [fetchNotifications, fetchUnreadCount, startPolling, stopPolling]);

  return (
    <div className="notifications-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: 0 }}>
        <Link
          to={dashboardPath}
          className="back-dashboard-btn"
          style={{
            padding: '0.45rem',
            background: 'none',
            color: '#3730a3',
            border: 'none',
            fontSize: '1.7rem',
            margin: 0,
            borderRadius: '50%',
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Back to Dashboard"
        >
          <span style={{ fontWeight: 700, fontSize: '1.7rem', lineHeight: 1 }}>&#8592;</span>
        </Link>
        <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.1 }}>Notifications</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: 0 }}>
        <p style={{ margin: 0, fontSize: '1.08rem', color: '#555', flex: 1 }}>
          Unread: {unreadCount}
        </p>
        <button
          onClick={markAllRead}
          className="main-action-btn"
          disabled={saving || unreadCount === 0}
        >
          Mark All Read
        </button>
      </div>

      {error ? (
        <p className="error-text" onClick={clearError}>
          {error}
        </p>
      ) : null}

      <div className="notification-list">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
          >
            <div>
              <p className="notification-meta">{notification.type_display || notification.type}</p>
              <p>{notification.message}</p>
              <p className="notification-meta">{notification.timestamp}</p>
            </div>
            <div className="notification-item-actions">
              {!notification.is_read ? (
                <button onClick={() => markRead(notification.id)} disabled={saving}>
                  Mark Read
                </button>
              ) : null}
              <button onClick={() => removeNotification(notification.id)} disabled={saving}>
                Delete
              </button>
            </div>
          </article>
        ))}

        {!loading && notifications.length === 0 ? <p>No notifications found.</p> : null}
      </div>
    </div>
  );
}
