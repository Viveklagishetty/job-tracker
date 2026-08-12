import { useState } from 'react'

const STATUSES = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Offer Received', 'Rejected']

export default function ApplicationForm({ initial, onSubmit, submitLabel }) {
  const [form, setForm] = useState({
    company: initial?.company || '',
    role: initial?.role || '',
    status: initial?.status || 'Applied',
    applied_on: initial?.applied_on || '',
    location: initial?.location || '',
    job_url: initial?.job_url || '',
    notes: initial?.notes || '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="app-form">
      {error && <p className="error">{error}</p>}

      <label>
        Company
        <input name="company" value={form.company} onChange={handleChange} required />
      </label>

      <label>
        Role
        <input name="role" value={form.role} onChange={handleChange} required />
      </label>

      <label>
        Status
        <select name="status" value={form.status} onChange={handleChange}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      <label>
        Applied On
        <input type="date" name="applied_on" value={form.applied_on} onChange={handleChange} required />
      </label>

      <label>
        Location
        <input name="location" value={form.location} onChange={handleChange} />
      </label>

      <label>
        Job URL
        <input name="job_url" value={form.job_url} onChange={handleChange} />
      </label>

      <label>
        Notes
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} />
      </label>

      <button type="submit">{submitLabel}</button>
    </form>
  )
}
