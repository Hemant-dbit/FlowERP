import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import useAuthStore from '../../auth/store/useAuthStore';
import { DASHBOARD_PATH_BY_ROLE, ROLES } from '../../../shared/constants/roles';
import EmployeeForm from '../components/EmployeeForm';
import useEmployeesStore from '../store/useEmployeesStore';

export default function EmployeesPage() {
  const { role } = useAuthStore();
  const {
    loading,
    saving,
    employees,
    selectedEmployee,
    myProfile,
    error,
    clearError,
    clearSelectedEmployee,
    fetchEmployees,
    fetchEmployeeDetail,
    fetchMyProfile,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployeesStore();

  const [mode, setMode] = useState(null);

  const canManage = role === ROLES.ADMIN || role === ROLES.MANAGER;
  const canDelete = role === ROLES.ADMIN;
  const dashboardPath = DASHBOARD_PATH_BY_ROLE[role] || DASHBOARD_PATH_BY_ROLE[ROLES.EMPLOYEE];

  useEffect(() => {
    fetchEmployees();
    fetchMyProfile();
  }, [fetchEmployees, fetchMyProfile]);

  const headerSummary = useMemo(() => {
    if (role === ROLES.EMPLOYEE) return 'View employee directory and your own profile';
    if (role === ROLES.MANAGER) return 'Manage employee profiles and team directory';
    return 'Admin employee management and directory';
  }, [role]);

  const openCreate = () => {
    clearSelectedEmployee();
    setMode('create');
  };

  const openEdit = async (employeeId) => {
    const result = await fetchEmployeeDetail(employeeId);
    if (result.ok) {
      setMode('edit');
    }
  };

  const closeForm = () => {
    setMode(null);
    clearSelectedEmployee();
  };

  const handleCreate = async (payload) => {
    const result = await createEmployee(payload);
    if (result.ok) {
      closeForm();
    }
  };

  const handleUpdate = async (payload) => {
    if (!selectedEmployee?.id) return;
    const result = await updateEmployee(selectedEmployee.id, payload);
    if (result.ok) {
      closeForm();
    }
  };

  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm('Delete this employee profile? This action cannot be undone.');
    if (!confirmed) return;
    await deleteEmployee(employeeId);
  };

  return (
    <div className="employees-page">
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
        <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.1 }}>Employees</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: 0 }}>
        <p style={{ margin: 0, fontSize: '1.08rem', color: '#555', flex: 1 }}>{headerSummary}</p>
        {canManage ? (
          <button type="button" className="main-action-btn" onClick={openCreate} disabled={saving}>
            New Employee
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="error-text" onClick={clearError}>
          {error}
        </p>
      ) : null}

      {myProfile ? (
        <section className="employee-profile-card">
          <h3>My Profile</h3>
          <p>Position: {myProfile.position || 'n/a'}</p>
          <p>Department: {myProfile.department_detail?.name || 'n/a'}</p>
          <p>Joining Date: {myProfile.joining_date || 'n/a'}</p>
        </section>
      ) : null}

      {mode === 'create' ? (
        <EmployeeForm mode="create" saving={saving} onCancel={closeForm} onSubmit={handleCreate} />
      ) : null}

      {mode === 'edit' && selectedEmployee ? (
        <EmployeeForm
          mode="edit"
          initialEmployee={selectedEmployee}
          saving={saving}
          onCancel={closeForm}
          onSubmit={handleUpdate}
        />
      ) : null}

      <div className="employee-list">
        {employees.map((employee) => (
          <article className="employee-card" key={employee.id}>
            <div>
              <h3>
                {employee.username || employee.user_detail?.username || `Employee #${employee.id}`}
              </h3>
              <p>Email: {employee.email || employee.user_detail?.email || 'n/a'}</p>
              <p>Position: {employee.position || 'n/a'}</p>
              <p>
                Department: {employee.department_name || employee.department_detail?.name || 'n/a'}
              </p>
              <p>Joining: {employee.joining_date || 'n/a'}</p>
            </div>

            <div className="employee-card-actions">
              {canManage ? (
                <button
                  type="button"
                  onClick={() => openEdit(employee.id)}
                  disabled={saving || loading}
                >
                  Edit
                </button>
              ) : null}
              {canDelete ? (
                <button type="button" onClick={() => handleDelete(employee.id)} disabled={saving}>
                  Delete
                </button>
              ) : null}
            </div>
          </article>
        ))}

        {!loading && employees.length === 0 ? <p>No employees found.</p> : null}
      </div>
    </div>
  );
}
