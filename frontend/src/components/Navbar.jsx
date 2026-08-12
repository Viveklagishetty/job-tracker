import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Job Tracker</div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/applications">Applications</Link>
        <Link to="/add">Add New</Link>
      </div>
      <div className="navbar-user">
        <span>{user?.username}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}
