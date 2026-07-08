import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import SourceBadge from '../components/SourceBadge'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import api from '../api'
import '../styles/Dashboard.css'

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let frame
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / 700, 1)
      setDisplay(Math.round(progress * value))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <span>{display}</span>
}

function AnimatedBar({ pct, color }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 150)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div className="dash-bar-track">
      <div className="dash-bar-fill" style={{ width: `${w}%`, background: color }} />
    </div>
  )
}

const SOURCE_COLORS = { audio: 'var(--coral)', text: 'var(--periwinkle)', code: 'var(--pink)', vtt: 'var(--teal)', file: 'var(--amber)' }

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const { activeProjectId } = useSelector((state) => state.project)
  const { addToast } = useToast()
  const [stats, setStats] = useState(null)
  const [coverage, setCoverage] = useState([])
  const [recurring, setRecurring] = useState([])
  const [pending, setPending] = useState([])

  useEffect(() => {
    api.getDashboardStats(activeProjectId).then(setStats)
    api.getTeamCoverage().then(setCoverage)
    api.getRecurringProblems().then(setRecurring)
    api.getPendingQueue().then(setPending)
  }, [activeProjectId])

  const handleVerify = async (id, status) => {
    await api.verifyEntry(id, status, user.id)
    setPending((prev) => prev.filter((p) => p.entry_id !== id))
    addToast(status === 'verified' ? 'Marked as confirmed' : 'Set aside for now')
  }

  if (!stats) {
    return (
      <div className="dash-page">
        <div className="dash-stats-row">
          {[1, 2, 3, 4].map((i) => <div key={i} className="shimmer-block" style={{ height: 100 }} />)}
        </div>
      </div>
    )
  }

  const totalSource = Object.values(stats.by_source).reduce((a, b) => a + b, 0)

  return (
    <div className="dash-page">
      <div className="page-header">
        <h1>How the team's doing</h1>
        <p>A quick look at what's been captured, and where the gaps still are.</p>
      </div>

      <div className="dash-stats-row">
        {[
          { label: 'Total entries', value: stats.total_entries, icon: 'ti-stack-2', color: 'var(--periwinkle)' },
          { label: 'Confirmed', value: stats.verified, icon: 'ti-circle-check', color: 'var(--success)' },
          { label: 'Waiting on review', value: stats.pending_review, icon: 'ti-eye', color: 'var(--warning)' },
          { label: 'Verification rate', value: stats.verification_rate_pct, suffix: '%', icon: 'ti-gauge', color: 'var(--teal)' },
        ].map((s, i) => (
          <div key={s.label} className="card card-hover dash-stat-card fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <i className={`ti ${s.icon}`} style={{ color: s.color }} aria-hidden="true" />
            <span className="dash-stat-value"><AnimatedNumber value={s.value} />{s.suffix || ''}</span>
            <span className="dash-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="dash-two-col">
        <div className="card dash-card">
          <h3>Where knowledge comes from</h3>
          <div className="dash-source-list">
            {Object.entries(stats.by_source).map(([key, count]) => {
              const pct = Math.round((count / totalSource) * 100)
              return (
                <div key={key} className="dash-source-row">
                  <div className="dash-source-label">
                    <SourceBadge source={key} />
                    <span>{count} entries</span>
                    <span className="dash-source-pct" style={{ color: SOURCE_COLORS[key] }}>{pct}%</span>
                  </div>
                  <AnimatedBar pct={pct} color={SOURCE_COLORS[key]} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="card dash-card">
          <h3>Most repeated problems</h3>
          <p className="dash-card-sub">Comes up a lot? Might be worth fixing the process, not just documenting it.</p>
          <div className="dash-recurring-list">
            {recurring.map((p, i) => (
              <div key={p.entry_id} className="dash-recurring-row">
                <span className={`dash-rank ${i < 2 ? 'hot' : ''}`}>{i + 1}</span>
                <div className="dash-recurring-info">
                  <span className="dash-recurring-title">{p.problem_summary}</span>
                  <span className="dash-recurring-team">{p.team}</span>
                </div>
                <span className="dash-recurring-count">
                  {p.frequency_seen >= 8 && <i className="ti ti-flame" aria-hidden="true" />} {p.frequency_seen}×
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card dash-card">
        <div className="dash-section-header">
          <h3>Team coverage</h3>
          <span className="dash-legend">Below 40% probably needs more attention</span>
        </div>
        {coverage.map((t) => {
          const low = t.coverage_pct < 40
          const color = low ? 'var(--danger)' : t.coverage_pct >= 70 ? 'var(--success)' : 'var(--periwinkle)'
          return (
            <div key={t.team} className={`dash-coverage-row ${low ? 'low' : ''}`}>
              <div className="dash-coverage-top">
                <span>
                  {t.team}
                  {low && <span className="dash-needs-tag">needs more coverage</span>}
                </span>
                <span style={{ color, fontWeight: 700 }}>{t.coverage_pct}%</span>
              </div>
              <AnimatedBar pct={t.coverage_pct} color={color} />
              <span className="dash-coverage-meta">{t.verified_entries} of {t.total_entries} entries confirmed</span>
            </div>
          )
        })}
      </div>

      <div className="card dash-card">
        <div className="dash-section-header">
          <h3>Waiting on a quick check</h3>
          <span className="dash-queue-count">{pending.length} left · lowest confidence first</span>
        </div>
        {pending.length === 0 ? (
          <EmptyState icon="ti-confetti" title="All caught up!" text="Nothing waiting on review right now." />
        ) : (
          pending.map((item) => (
            <div key={item.entry_id} className="dash-queue-row fade-in-up">
              <div className="dash-queue-info">
                <div className="dash-queue-top">
                  <SourceBadge source={item.source_type} />
                  <span className="dash-queue-conf">{Math.round(item.confidence_score * 100)}% confident</span>
                </div>
                <p>{item.problem_summary}</p>
                <span className="dash-queue-by">{item.employee} · {item.team}</span>
              </div>
              <div className="dash-queue-actions">
                <button className="btn btn-danger" onClick={() => handleVerify(item.entry_id, 'rejected')}>Set aside</button>
                <button className="btn btn-primary" onClick={() => handleVerify(item.entry_id, 'verified')}>Looks right</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
