import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import useAuthStore from '../store/useAuthStore'

const initialForm = {
  username: '',
  first_name: '',
  role: 'employee',
  password: '',
  password2: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, isAuthenticated, error, clearError } = useAuthStore()
  const [form, setForm] = useState(initialForm)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (error) {
      clearError()
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      username: form.username.trim(),
      // Backend currently requires email and last_name.
      // Keep them synthetic here until profile/contact step is implemented.
      email: `${form.username.trim()}@pending.local`,
      first_name: form.first_name.trim(),
      last_name: 'Pending',
      role: form.role,
      password: form.password,
      password2: form.password2,
    }

    const result = await register(payload)
    if (result.ok) {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p>Create account with core fields. Contact details can be completed later.</p>

        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" value={form.username} onChange={handleChange} required />

        <label htmlFor="first_name">First name</label>
        <input id="first_name" name="first_name" type="text" value={form.first_name} onChange={handleChange} required />

        <label htmlFor="role">Role</label>
        <select id="role" name="role" value={form.role} onChange={handleChange}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />

        <label htmlFor="password2">Confirm password</label>
        <input id="password2" name="password2" type="password" value={form.password2} onChange={handleChange} required />

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}
