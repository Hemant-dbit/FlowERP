import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  user: '',
  position: '',
  joining_date: '',
  department: '',
};

function toFormState(employee) {
  if (!employee) return EMPTY_FORM;
  return {
    user: employee.user ? String(employee.user) : '',
    position: employee.position || '',
    joining_date: employee.joining_date || '',
    department: employee.department ? String(employee.department) : '',
  };
}

export default function EmployeeForm({
  mode = 'create',
  initialEmployee = null,
  saving = false,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(toFormState(initialEmployee));
  }, [initialEmployee]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      position: form.position.trim(),
      joining_date: form.joining_date,
    };

    if (mode === 'create') {
      payload.user = Number(form.user);
    }

    if (form.department) {
      payload.department = Number(form.department);
    }

    await onSubmit(payload);
  };

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <h3>{mode === 'create' ? 'Create Employee Profile' : 'Edit Employee Profile'}</h3>

      {mode === 'create' ? (
        <label>
          User ID
          <input
            name="user"
            type="number"
            min="1"
            value={form.user}
            onChange={handleChange}
            required
            placeholder="Enter existing user id"
          />
        </label>
      ) : null}

      <label>
        Position
        <input
          name="position"
          type="text"
          value={form.position}
          onChange={handleChange}
          required
          placeholder="e.g. Senior Developer"
        />
      </label>

      <label>
        Joining Date
        <input
          name="joining_date"
          type="date"
          value={form.joining_date}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Department ID (optional)
        <input
          name="department"
          type="number"
          min="1"
          value={form.department}
          onChange={handleChange}
          placeholder="Department id"
        />
      </label>

      <div className="employee-form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
