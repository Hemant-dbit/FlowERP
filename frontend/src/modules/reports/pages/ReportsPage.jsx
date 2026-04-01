import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../auth/store/useAuthStore';
import useReportsStore from '../store/useReportsStore';
import { DASHBOARD_PATH_BY_ROLE, ROLES } from '../../../shared/constants/roles';

const REPORT_TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'tasksByStatus', label: 'Tasks by Status', icon: '✓' },
  { id: 'employeeWorkload', label: 'Employee Workload', icon: '👥' },
  { id: 'projectProgress', label: 'Project Progress', icon: '📈' },
  { id: 'weeklyCompletions', label: 'Weekly Completions', icon: '📅' },
  { id: 'departmentSummary', label: 'Department Summary', icon: '🏢' },
];

// Badge component for status
function StatusBadge({ status }) {
  const statusColors = {
    active: '#10b981',
    completed: '#3b82f6',
    pending: '#f59e0b',
    paused: '#6b7280',
    in_progress: '#8b5cf6',
    blocked: '#ef4444',
  };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        backgroundColor: statusColors[status?.toLowerCase()] || '#e5e7eb',
        color: '#fff',
      }}
    >
      {status}
    </span>
  );
}

// Progress bar component
function ProgressBar({ value, max = 100 }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div
        style={{
          flex: 1,
          height: '6px',
          backgroundColor: '#e5e7eb',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: '#3b82f6',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', minWidth: '40px' }}>
        {value}%
      </span>
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const store = useReportsStore();
  const { role } = useAuthStore();
  const dashboardPath = DASHBOARD_PATH_BY_ROLE[role] || DASHBOARD_PATH_BY_ROLE[ROLES.EMPLOYEE];

  useEffect(() => {
    switch (activeTab) {
      case 'overview':
        store.fetchOverview();
        break;
      case 'tasksByStatus':
        store.fetchTasksByStatus();
        break;
      case 'employeeWorkload':
        store.fetchEmployeeWorkload();
        break;
      case 'projectProgress':
        store.fetchProjectProgress();
        break;
      case 'weeklyCompletions':
        store.fetchWeeklyCompletions();
        break;
      case 'departmentSummary':
        store.fetchDepartmentSummary();
        break;
      default:
        break;
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Helper: check if value is HTML (error page)
  function isHtmlResponse(val) {
    if (!val) return false;
    if (typeof val === 'string' && val.trim().startsWith('<!DOCTYPE html')) return true;
    if (typeof val === 'object' && val.html) return true;
    return false;
  }

  // Table renderers for each report type
  function renderOverview(data) {
    if (!data) return <p style={{ textAlign: 'center', color: '#6b7280' }}>No data.</p>;
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
        }}
      >
        {Object.entries(data).map(([k, v]) => (
          <div
            key={k}
            style={{
              padding: '1.5rem',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <p
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '500',
              }}
            >
              {k.replace(/_/g, ' ')}
            </p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{v}</p>
          </div>
        ))}
      </div>
    );
  }

  function renderTasksByStatus(data) {
    if (!data) return <p style={{ textAlign: 'center', color: '#6b7280' }}>No data.</p>;
    return (
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <table className="report-table" style={{ marginBottom: 0 }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'left',
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'right',
                }}
              >
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([status, count], idx) => (
              <tr
                key={status}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f9fafb')
                }
              >
                <td style={{ padding: '1rem' }}>
                  <StatusBadge status={status} />
                </td>
                <td
                  style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#111827',
                  }}
                >
                  {count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderEmployeeWorkload(data) {
    if (!Array.isArray(data) || data.length === 0)
      return <p style={{ textAlign: 'center', color: '#6b7280' }}>No data.</p>;
    return (
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <table className="report-table" style={{ marginBottom: 0 }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'left',
                }}
              >
                User
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'left',
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Active
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Completed
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.user_id}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f9fafb')
                }
              >
                <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>
                  {row.username}
                </td>
                <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  {row.email}
                </td>
                <td
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#8b5cf6',
                    fontWeight: '600',
                  }}
                >
                  {row.active_tasks}
                </td>
                <td
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#10b981',
                    fontWeight: '600',
                  }}
                >
                  {row.completed_tasks}
                </td>
                <td
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontWeight: '700',
                    color: '#111827',
                  }}
                >
                  {row.total_tasks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderProjectProgress(data) {
    if (!Array.isArray(data) || data.length === 0)
      return <p style={{ textAlign: 'center', color: '#6b7280' }}>No data.</p>;
    return (
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <table className="report-table" style={{ marginBottom: 0 }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'left',
                }}
              >
                Project
              </th>
              <th
                style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}
              >
                Status
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Total
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Done
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.project_id}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f9fafb')
                }
              >
                <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>
                  {row.project_name}
                </td>
                <td style={{ padding: '1rem' }}>
                  <StatusBadge status={row.status} />
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                  {row.total_tasks}
                </td>
                <td
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#10b981',
                    fontWeight: '600',
                  }}
                >
                  {row.completed_tasks}
                </td>
                <td style={{ padding: '1rem' }}>
                  <ProgressBar value={row.completion_percentage} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderWeeklyCompletions(data) {
    if (!Array.isArray(data) || data.length === 0)
      return <p style={{ textAlign: 'center', color: '#6b7280' }}>No data.</p>;
    return (
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <table className="report-table" style={{ marginBottom: 0 }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'left',
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'right',
                }}
              >
                Completed Tasks
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.date}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f9fafb')
                }
              >
                <td style={{ padding: '1rem', color: '#6b7280' }}>{row.date}</td>
                <td
                  style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#10b981',
                  }}
                >
                  {row.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderDepartmentSummary(data) {
    if (!Array.isArray(data) || data.length === 0)
      return <p style={{ textAlign: 'center', color: '#6b7280' }}>No data.</p>;
    return (
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <table className="report-table" style={{ marginBottom: 0 }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'left',
                }}
              >
                Department
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Employees
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Total Tasks
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Completed
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Active
              </th>
              <th
                style={{
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}
              >
                Avg/Emp
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.department_id}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f9fafb')
                }
              >
                <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>
                  {row.department_name}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                  {row.employee_count}
                </td>
                <td
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#111827',
                  }}
                >
                  {row.total_tasks}
                </td>
                <td
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#10b981',
                    fontWeight: '600',
                  }}
                >
                  {row.completed_tasks}
                </td>
                <td
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#8b5cf6',
                    fontWeight: '600',
                  }}
                >
                  {row.active_tasks}
                </td>
                <td
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#111827',
                  }}
                >
                  {row.avg_tasks_per_employee}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const renderReport = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview(store.overview);
      case 'tasksByStatus':
        return renderTasksByStatus(store.tasksByStatus);
      case 'employeeWorkload':
        return renderEmployeeWorkload(store.employeeWorkload);
      case 'projectProgress':
        return renderProjectProgress(store.projectProgress);
      case 'weeklyCompletions':
        return renderWeeklyCompletions(store.weeklyCompletions);
      case 'departmentSummary':
        if (isHtmlResponse(store.departmentSummary)) {
          return (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              No department summary data available.
            </p>
          );
        }
        return renderDepartmentSummary(store.departmentSummary);
      default:
        return <p style={{ textAlign: 'center', color: '#6b7280' }}>Unknown report.</p>;
    }
  };

  return (
    <div className="reports-page" style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          marginBottom: '1.5rem',
          padding: '1.5rem 2rem 0 2rem',
        }}
      >
        <Link
          to={dashboardPath}
          className="back-dashboard-btn"
          style={{
            padding: '0.45rem 0.65rem',
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
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Back to Dashboard"
        >
          ←
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#111827' }}>
          Reports Dashboard
        </h1>
      </div>
      <div className="reports-layout">
        <aside
          className="reports-sidebar"
          style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
        >
          {REPORT_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`reports-tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#e0e7ff' : 'transparent',
                color: activeTab === tab.id ? '#3730a3' : '#6b7280',
                cursor: 'pointer',
                borderLeft: activeTab === tab.id ? '3px solid #3730a3' : '3px solid transparent',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                fontWeight: activeTab === tab.id ? '600' : '500',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>
        <main className="reports-body" style={{ padding: '2rem' }}>
          {store.loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p style={{ fontSize: '1.1rem' }}>Loading report...</p>
            </div>
          ) : store.error ? (
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: '#fee2e2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                color: '#991b1b',
              }}
            >
              <p style={{ margin: 0, fontWeight: '600' }}>Error</p>
              <p style={{ margin: '0.5rem 0 0 0' }}>{store.error}</p>
            </div>
          ) : (
            renderReport()
          )}
        </main>
      </div>
    </div>
  );
}
