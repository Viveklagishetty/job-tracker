import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ApplicationForm from '../components/ApplicationForm'
import api from '../api'

export default function EditApplicationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [app, setApp] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Reuse the list endpoint and find the one we need
    // (a GET /api/applications/<id> single-item endpoint could be added later)
    api.get('/api/applications')
      .then((res) => {
        const found = res.data.find((a) => String(a.id) === id)
        if (!found) {
          setError('Application not found')
        } else {
          setApp(found)
        }
      })
      .catch(() => setError('Failed to load application'))
  }, [id])

  const handleUpdate = async (form) => {
    await api.put(`/api/applications/${id}`, form)
    navigate('/applications')
  }

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1>Edit Application</h1>
        {error && <p className="error">{error}</p>}
        {app && <ApplicationForm initial={app} onSubmit={handleUpdate} submitLabel="Save Changes" />}
      </div>
    </div>
  )
}
