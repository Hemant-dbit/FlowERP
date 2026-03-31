import { Link } from 'react-router-dom'

export default function ForbiddenPage() {
  return (
    <div className="forbidden-page">
      <h1>403</h1>
      <p>You do not have permission to access this page.</p>
      <Link to="/">Back to dashboard</Link>
    </div>
  )
}
