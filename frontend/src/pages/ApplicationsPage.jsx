import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ApplicationCard from '../components/ApplicationCard'
import api from '../api'

const STATUSES = ['All', 'Applied', 'Shortlisted', 'Interview Scheduled', 'Offer Received', 'Rejected']

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')

  const loadApplications = () => {
    api.get('/api/applications')
      .then((res) => setApplications(res.data))
      .catch(() => setError('Failed to load applications'))
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return
    try {
      await api.delete(`/api/applications/${id}`)
      setApplications((prev) => prev.filter((a) => a.id !== id))
    } catch {
      setError('Failed to delete application')
    }
  }

  const visible = filter === 'All'
    ? applications
    : applications.filter((a) => a.status === filter)

  return (
    <div>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>Applications</h1>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="app-list">
          {visible.length === 0 && <p>No applications found.</p>}
          {visible.map((app) => (
            <ApplicationCard key={app.id} app={app} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  )
}
