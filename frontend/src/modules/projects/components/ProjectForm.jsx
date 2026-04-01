import { useMemo, useState, useEffect } from 'react';
import useEmployeesStore from '../../employees/store/useEmployeesStore';

const DEFAULT_FORM = {
  name: '',
  status: 'active',
  start_date: '',
  end_date: '',
  members: [],
};

export default function ProjectForm({ mode = 'create', initialValues, onSubmit, saving }) {
  const mergedInitial = useMemo(
    () => ({ ...DEFAULT_FORM, ...(initialValues || {}) }),
    [initialValues]
  );

  const [form, setForm] = useState(mergedInitial);
  const [memberDropdownValue, setMemberDropdownValue] = useState('');
  const { employees, loading: employeesLoading, fetchEmployees } = useEmployeesStore();

  useEffect(() => {
    // Fetch available employees only for create mode
    if (mode === 'create') {
      fetchEmployees();
    }
  }, [mode, fetchEmployees]);

  const handleChange = (event) => {
    const { name, value, type } = event.target;

    if (type === 'select-one' && name === 'member-select') {
      // Handle single select for adding members (using user_id)
      const selectedUserIdStr = String(value);
      if (selectedUserIdStr && !form.members.includes(parseInt(selectedUserIdStr))) {
        setForm((prev) => ({ ...prev, members: [...prev.members, parseInt(selectedUserIdStr)] }));
      }
      setMemberDropdownValue('');
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.filter((id) => id !== userId),
    }));
  };

  const getSelectedMembersInfo = () => {
    return form.members.map((userId) => {
      const emp = employees.find((e) => e.user_id === userId);
      return {
        userId: userId,
        username: emp?.username || `User ${userId}`,
      };
    });
  };

  const availableEmployees = employees.filter((emp) => !form.members.includes(emp.user_id));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    // Only include members if in create mode and members are selected
    if (form.members && form.members.length > 0) {
      payload.members = form.members;
    }

    await onSubmit(payload);
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h2>{mode === 'create' ? 'Create Project' : 'Update Project'}</h2>

      <label htmlFor="project-name">Name</label>
      <input
        id="project-name"
        name="name"
        type="text"
        value={form.name}
        onChange={handleChange}
        required
      />

      <label htmlFor="project-status">Status</label>
      <select id="project-status" name="status" value={form.status} onChange={handleChange}>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <label htmlFor="project-start">Start Date</label>
      <input
        id="project-start"
        name="start_date"
        type="date"
        value={form.start_date || ''}
        onChange={handleChange}
      />

      <label htmlFor="project-end">End Date</label>
      <input
        id="project-end"
        name="end_date"
        type="date"
        value={form.end_date || ''}
        onChange={handleChange}
      />

      {mode === 'create' && (
        <>
          <label htmlFor="member-select">
            Add Members (Optional){' '}
            {employeesLoading && <span style={{ color: '#6b7280' }}>Loading...</span>}
          </label>
          <select
            id="member-select"
            name="member-select"
            value={memberDropdownValue}
            onChange={handleChange}
            disabled={employeesLoading || availableEmployees.length === 0}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              width: '100%',
            }}
          >
            <option value="">-- Select a member to add --</option>
            {availableEmployees.map((emp) => (
              <option key={emp.user_id} value={emp.user_id}>
                User ID: {emp.user_id} - {emp.username || 'Unknown'}
              </option>
            ))}
          </select>

          {getSelectedMembersInfo().length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                Selected Members:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {getSelectedMembersInfo().map((member) => (
                  <div
                    key={member.userId}
                    style={{
                      background: '#e5e7eb',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <span>
                      User ID: {member.userId} - {member.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.userId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0',
                        lineHeight: '1',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
}
