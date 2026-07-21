import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import EmptyState from '../components/EmptyState'
import api from '../api'
import '../styles/Tickets.css'

const priorityColor = { High: 'pink', Medium: 'amber', Low: 'teal' }

export default function MyTickets() {
  const navigate = useNavigate()
  const resolvedIds = useSelector((state) => state.tickets.resolvedIds)
  const [tickets, setTickets] = useState(null)

  useEffect(() => {
    api.getTickets().then(setTickets)
  }, [])

  return (
    <div className="tickets-page">
      <div className="page-header">
        <h1>My Tickets</h1>
        <p>Pick one, solve it live with KTHub, and capture the reasoning behind the fix — not just the fix itself.</p>
      </div>

      {tickets === null ? null : tickets.length === 0 ? (
        <EmptyState icon="ti-ticket" title="No tickets assigned" text="Nothing here right now." />
      ) : (
        <div className="tickets-grid">
          {tickets.map((t) => {
            const isResolved = resolvedIds.includes(t.id)
            return (
              <div key={t.id} className="card card-hover ticket-card fade-in-up">
                <div className="ticket-card-top">
                  <span className="ticket-id">{t.id}</span>
                  <span className={`pill tag-pill tag-${priorityColor[t.priority] || 'periwinkle'}`}>
                    {t.priority}
                  </span>
                </div>
                <h3 className="ticket-title">{t.title}</h3>
                <p className="ticket-desc">{t.description}</p>
                <div className="ticket-card-footer">
                  <span className={`pill role-pill ${isResolved ? 'role-teal' : 'role-periwinkle'}`}>
                    {isResolved ? 'Resolved · Captured' : t.status}
                  </span>
                  {!isResolved && (
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/tickets/${t.id}/solve`)}
                    >
                      <i className="ti ti-message-2-bolt" aria-hidden="true" /> Solve with KTHub
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
