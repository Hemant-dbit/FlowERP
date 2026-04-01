import { Link } from 'react-router-dom';

export default function NotificationBell({ unreadCount = 0 }) {
  return (
    <Link to="/notifications" className="notification-bell" aria-label="Open notifications">
      <span className="notification-icon">Notifications</span>
      {unreadCount > 0 ? <span className="notification-badge">{unreadCount}</span> : null}
    </Link>
  );
}
