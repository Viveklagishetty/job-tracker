import { Link } from 'react-router-dom'

const STATUS_CLASS = {
  'Applied': 'badge badge-applied',
  'Shortlisted': 'badge badge-shortlisted',
  'Interview Scheduled': 'badge badge-interview',
  'Offer Received': 'badge badge-offer',
  'Rejected': 'badge badge-rejected',
}

export default function ApplicationCard({ app, onDelete }) {
  return (
    <div className="app-card">
      <div className="app-card-main">
        <h3>{app.role}</h3>
        <p className="company">{app.company}</p>
        {app.location && <p className="location">{app.location}</p>}
        <p className="applied-on">Applied on {app.applied_on}</p>
      </div>
      <div className="app-card-side">
        <span className={STATUS_CLASS[app.status] || 'badge'}>{app.status}</span>
        <div className="app-card-actions">
          <Link to={`/edit/${app.id}`}>Edit</Link>
          <button onClick={() => onDelete(app.id)}>Delete</button>
        </div>
      </div>
    </div>
  )
}
