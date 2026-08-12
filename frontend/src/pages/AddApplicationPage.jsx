import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ApplicationForm from '../components/ApplicationForm'
import api from '../api'

export default function AddApplicationPage() {
  const navigate = useNavigate()

  const handleAdd = async (form) => {
    await api.post('/api/applications', form)
    navigate('/applications')
  }

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1>Add Application</h1>
        <ApplicationForm onSubmit={handleAdd} submitLabel="Add Application" />
      </div>
    </div>
  )
}
