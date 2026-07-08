import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import SourceBadge from '../components/SourceBadge'
import ConfidenceBar from '../components/ConfidenceBar'
import StarRating from '../components/StarRating'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import api from '../api'
import '../styles/KnowledgeBase.css'

const SOURCE_FILTERS = [
  ['', 'All'], ['audio', 'Voice'], ['text', 'Text'], ['code', 'Code'], ['vtt', 'Meeting'], ['file', 'File'],
]
const STATUS_FILTERS = [
  ['', 'Any status'], ['verified', 'Confirmed'], ['pending', 'Needs a look'], ['rejected', 'Set aside'],
]

const statusTone = { verified: 'success', pending: 'warning', rejected: 'danger' }
const statusLabel = { verified: 'Confirmed', pending: 'Needs a look', rejected: 'Set aside' }

export default function KnowledgeBase() {
  const { user } = useSelector((state) => state.auth)
  const { activeProjectId } = useSelector((state) => state.project)
  const { addToast } = useToast()
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [scope, setScope] = useState('project')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setData(null)
    api.getEntries({
      requester_id: user.id,
      project_id: scope === 'project' ? activeProjectId : undefined,
      source_type: sourceFilter || undefined,
      status: statusFilter || undefined,
    }).then(setData)
  }, [activeProjectId, sourceFilter, statusFilter, scope, user.id])

  const canVerify = user.role_type === 'tech_lead' || user.role_type === 'admin'

  const handleVerify = async (id, status) => {
    await api.verifyEntry(id, status, user.id)
    setData((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => e.id === id ? { ...e, verification_status: status } : e),
    }))
    addToast(status === 'verified' ? 'Marked as confirmed' : 'Set aside for now')
    setSelected(null)
  }

  const filtered = (data?.entries || []).filter((e) =>
    !search ||
    e.problem_summary.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="kb-page">
      <div className="page-header">
        <h1>Everything the team knows</h1>
        <p>Browse what's been captured so far — search, filter, or just scroll through.</p>
      </div>

      {!data ? (
        <>
          <div className="kb-stats-row">
            {[1, 2, 3, 4].map((i) => <div key={i} className="shimmer-block" style={{ height: 86 }} />)}
          </div>
          <div className="kb-grid" style={{ marginTop: 20 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="shimmer-block" style={{ height: 200 }} />)}
          </div>
        </>
      ) : (
        <>
          <div className="kb-stats-row">
            {[
              { label: 'Total entries', value: data.total, icon: 'ti-stack-2', color: 'var(--periwinkle)' },
              { label: 'Confirmed', value: data.verified, icon: 'ti-circle-check', color: 'var(--success)' },
              { label: 'Needs a look', value: data.pending, icon: 'ti-eye', color: 'var(--warning)' },
              { label: 'New this week', value: data.this_week, icon: 'ti-sparkles', color: 'var(--teal)' },
            ].map((s, i) => (
              <div key={s.label} className="card card-hover kb-stat-card fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <i className={`ti ${s.icon}`} style={{ color: s.color }} aria-hidden="true" />
                <span className="kb-stat-value">{s.value}</span>
                <span className="kb-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="kb-toolbar">
            <div className="kb-search-wrap">
              <i className="ti ti-search" aria-hidden="true" />
              <input className="input kb-search" placeholder="Search what someone learned…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="kb-scope-toggle">
              <button className={scope === 'project' ? 'active' : ''} onClick={() => setScope('project')}>This project</button>
              <button className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>Everything I can see</button>
            </div>
          </div>

          <div className="kb-filters">
            <div className="kb-filter-group">
              {SOURCE_FILTERS.map(([val, label]) => (
                <button key={val} className={`pill kb-filter-chip ${sourceFilter === val ? 'active' : ''}`}
                  onClick={() => setSourceFilter(val)}>{label}</button>
              ))}
            </div>
            <div className="kb-filter-group">
              {STATUS_FILTERS.map(([val, label]) => (
                <button key={val} className={`pill kb-filter-chip ${statusFilter === val ? 'active' : ''}`}
                  onClick={() => setStatusFilter(val)}>{label}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon="ti-mood-empty"
              title="Nothing matches yet"
              text="Try a different word, or clear the filters."
            />
          ) : (
            <div className="kb-grid">
              {filtered.map((entry, i) => (
                <div key={entry.id} className="card card-hover kb-entry-card fade-in-up"
                  style={{ animationDelay: `${i * 0.04}s` }} onClick={() => setSelected(entry)}>
                  <div className="kb-entry-top">
                    <SourceBadge source={entry.source_type} />
                    {entry.frequency_seen >= 5 && (
                      <span className="fire-chip"><i className="ti ti-flame" aria-hidden="true" /> {entry.frequency_seen}×</span>
                    )}
                  </div>
                  <h3 className="kb-entry-title">{entry.problem_summary}</h3>
                  <div className="kb-entry-tags">
                    {entry.tags.slice(0, 3).map((t) => <span key={t} className="kb-tag-mini">{t}</span>)}
                  </div>
                  <ConfidenceBar value={entry.confidence_score} compact />
                  <div className="kb-entry-footer">
                    <span>{entry.employee}</span>
                    <span className={`kb-status-dot dot-${statusTone[entry.verification_status]}`} />
                    <span>{statusLabel[entry.verification_status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selected && (
        <div className="kb-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="kb-modal pop-in" onClick={(e) => e.stopPropagation()}>
            <div className="kb-modal-header">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="kb-modal-id">{selected.id}</span>
                <SourceBadge source={selected.source_type} />
                {selected.code_capture_subtype && (
                  <span className="pill source-badge source-pink">{selected.code_capture_subtype.replace('_', ' ')}</span>
                )}
              </div>
              <button className="kb-modal-close" onClick={() => setSelected(null)} aria-label="Close">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
            <h2 className="kb-modal-title">{selected.problem_summary}</h2>

            <div className="kb-modal-section">
              <label>Why it happened</label>
              <p>{selected.root_cause}</p>
            </div>

            <div className="kb-modal-section">
              <label>How it was fixed</label>
              <ol className="kb-modal-steps">
                {selected.solution_steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>

            {selected.repo_name && (
              <div className="kb-modal-section">
                <label>Where in the code</label>
                <p className="kb-modal-code">{selected.repo_name} · {selected.file_path}</p>
              </div>
            )}

            <ConfidenceBar value={selected.confidence_score} />

            <div className="kb-modal-meta">
              <span>By <strong>{selected.employee}</strong></span>
              <span>{selected.capture_date}</span>
              <span>Seen {selected.frequency_seen}×</span>
            </div>

            <div className="kb-modal-rating">
              <span>Was this useful?</span>
              <StarRating entryId={selected.id} employeeId={user.id} />
            </div>

            {canVerify && selected.verification_status === 'pending' && (
              <div className="kb-modal-actions">
                <button className="btn btn-danger" onClick={() => handleVerify(selected.id, 'rejected')}>Set aside</button>
                <button className="btn btn-primary" onClick={() => handleVerify(selected.id, 'verified')}>Looks right</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
