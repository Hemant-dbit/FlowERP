import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import useAuthStore from '../store/useAuthStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, isAuthenticated, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ username: '', password: '' })

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
      password: form.password,
    }
    
    const result = await login(payload)

    if (result.ok) {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>FlowERP Login</h1>
        <p>Sign in with your backend credentials.</p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          required
          autoComplete="username"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="auth-footer">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  )
}
