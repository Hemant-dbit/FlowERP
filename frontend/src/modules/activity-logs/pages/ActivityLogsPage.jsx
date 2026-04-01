import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import useAuthStore from '../../auth/store/useAuthStore';
import { DASHBOARD_PATH_BY_ROLE, ROLES } from '../../../shared/constants/roles';
import ActivityLogFilters from '../components/ActivityLogFilters';
import useActivityLogsStore from '../store/useActivityLogsStore';

function renderMapItems(label, valueMap) {
  const entries = Object.entries(valueMap || {});

  return (
    <div>
      <h4>{label}</h4>
      {entries.length === 0 ? <p>No data</p> : null}
      <div className="activity-stats-grid">
        {entries.map(([key, value]) => (
          <div className="activity-stat-card" key={key}>
            <p>{key}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ActivityLogsPage() {
  const { role } = useAuthStore();
  const { loading, saving, logs, stats, error, clearError, fetchLogs, fetchStats, deleteLog } =
    useActivityLogsStore();
  const [activeFilters, setActiveFilters] = useState({});

  const isAdmin = role === ROLES.ADMIN;
  const dashboardPath = DASHBOARD_PATH_BY_ROLE[role] || DASHBOARD_PATH_BY_ROLE[ROLES.EMPLOYEE];

  useEffect(() => {
    fetchLogs({ myOnly: !isAdmin, filters: activeFilters });
    fetchStats();
  }, [fetchLogs, fetchStats, isAdmin, activeFilters]);

  const subtitle = useMemo(() => {
    if (isAdmin) return 'All activity logs with advanced filtering';
    return 'Your activity history and personal stats';
  }, [isAdmin]);

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const handleDelete = async (logId) => {
    const confirmed = window.confirm('Delete this activity log?');
    if (!confirmed) return;
    await deleteLog(logId);
  };

  return (
    <div className="activity-logs-page">
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
        <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.1 }}>Activity Logs</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: 0 }}>
        <p style={{ margin: 0, fontSize: '1.08rem', color: '#555', flex: 1 }}>{subtitle}</p>
      </div>

      {error ? (
        <p className="error-text" onClick={clearError}>
          {error}
        </p>
      ) : null}

      <div className="activity-layout">
        <ActivityLogFilters
          includeUserFilter={isAdmin}
          loading={loading}
          onApply={handleApplyFilters}
        />

        <section className="activity-stats-panel">
          <h3>Statistics</h3>
          <p>Total logs: {stats?.total_logs ?? 0}</p>
          {renderMapItems('By Action', stats?.action_counts)}
          {renderMapItems('By Content Type', stats?.content_type_counts)}
        </section>
      </div>

      <div className="activity-log-list">
        {logs.map((log) => (
          <article className="activity-log-item" key={log.id}>
            <div>
              <h3>{log.action}</h3>
              <p>User: {log.username || log.user_detail?.username || 'n/a'}</p>
              <p>
                Target: {log.content_type_name || 'unknown'} #{log.object_id}
              </p>
              <p>Time: {log.timestamp}</p>
            </div>

            {isAdmin ? (
              <div className="activity-log-item-actions">
                <button type="button" onClick={() => handleDelete(log.id)} disabled={saving}>
                  Delete
                </button>
              </div>
            ) : null}
          </article>
        ))}

        {!loading && logs.length === 0 ? <p>No activity logs found.</p> : null}
      </div>
    </div>
  );
}
