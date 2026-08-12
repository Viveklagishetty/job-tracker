import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api'

const STATUSES = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Offer Received', 'Rejected']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/applications/stats')
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load dashboard stats'))
  }, [])

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1>Dashboard</h1>
        {error && <p className="error">{error}</p>}

        {stats && (
          <>
            <div className="stat-cards">
              <div className="stat-card total">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Applications</span>
              </div>
              {STATUSES.map((status) => (
                <div className="stat-card" key={status}>
                  <span className="stat-number">{stats.by_status[status] || 0}</span>
                  <span className="stat-label">{status}</span>
                </div>
              ))}
            </div>

            <h2>Latest Applications</h2>
            <table className="latest-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {stats.latest.map((app) => (
                  <tr key={app.id}>
                    <td>{app.company}</td>
                    <td>{app.role}</td>
                    <td>{app.status}</td>
                    <td>{app.applied_on}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
