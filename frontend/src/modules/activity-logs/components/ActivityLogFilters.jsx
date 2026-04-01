import { useState } from 'react';

const EMPTY_FILTERS = {
  user: '',
  action: '',
  content_type: '',
  start_date: '',
  end_date: '',
};

function sanitizeFilters(raw, includeUserFilter) {
  const sanitized = {};

  if (includeUserFilter && raw.user) sanitized.user = raw.user;
  if (raw.action.trim()) sanitized.action = raw.action.trim();
  if (raw.content_type.trim()) sanitized.content_type = raw.content_type.trim();
  if (raw.start_date) sanitized.start_date = raw.start_date;
  if (raw.end_date) sanitized.end_date = raw.end_date;

  return sanitized;
}

export default function ActivityLogFilters({
  includeUserFilter = false,
  loading = false,
  onApply,
}) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = (event) => {
    event.preventDefault();
    onApply(sanitizeFilters(filters, includeUserFilter));
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    onApply({});
  };

  return (
    <form className="activity-filters" onSubmit={handleApply}>
      <h3>Filters</h3>

      {includeUserFilter ? (
        <label>
          User ID
          <input
            type="number"
            min="1"
            name="user"
            value={filters.user}
            onChange={handleChange}
            placeholder="Filter by user id"
          />
        </label>
      ) : null}

      <label>
        Action
        <input
          type="text"
          name="action"
          value={filters.action}
          onChange={handleChange}
          placeholder="e.g. created"
        />
      </label>

      <label>
        Content Type
        <input
          type="text"
          name="content_type"
          value={filters.content_type}
          onChange={handleChange}
          placeholder="task, project, comment"
        />
      </label>

      <label>
        Start Date
        <input type="date" name="start_date" value={filters.start_date} onChange={handleChange} />
      </label>

      <label>
        End Date
        <input type="date" name="end_date" value={filters.end_date} onChange={handleChange} />
      </label>

      <div className="activity-filter-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Applying...' : 'Apply'}
        </button>
        <button type="button" onClick={handleReset} disabled={loading}>
          Reset
        </button>
      </div>
    </form>
  );
}
