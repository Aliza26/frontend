import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useToast } from '../components/Toast'
import api from '../api'
import '../styles/Admin.css'

const roleColor = { developer: 'periwinkle', tech_lead: 'teal', admin: 'coral' }

export default function Admin() {
  const { user } = useSelector((state) => state.auth)
  const { addToast } = useToast()
  const [people, setPeople] = useState([])
  const [health, setHealth] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', description: '', repo_url: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api.getAllEmployees().then(setPeople)
    api.getSystemHealth().then(setHealth)
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.name.trim() && form.code.trim().length >= 2 && form.code.trim().length <= 10

  const handleCreate = async () => {
    setCreating(true)
    try {
      const proj = await api.createProject(form, user.id)
      addToast(`Project ${proj.name} created`)
      setForm({ name: '', code: '', description: '', repo_url: '' })
    } finally {
      setCreating(false)
    }
  }

  if (!health) return <div className="shimmer-block" style={{ height: 400, borderRadius: 18 }} />

  const storePct = Math.round((health.storage_used_mb / health.storage_total_mb) * 100)

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Behind the scenes</h1>
        <p>Manage the team and keep an eye on how the system's running.</p>
      </div>

      <div className="admin-two-col">
        <div className="admin-left">
          <div className="card admin-card">
            <h3>People</h3>
            <div className="admin-user-list">
              {people.map((u) => (
                <div key={u.id} className="admin-user-row">
                  <div className="admin-avatar">{u.name.split(' ').map((n) => n[0]).join('')}</div>
                  <div className="admin-user-info">
                    <span className="admin-user-name">{u.name}</span>
                    <span className="admin-user-email">{u.email}</span>
                    <span className="admin-user-projects">{u.projects.join(' · ')}</span>
                  </div>
                  <span className={`pill role-pill role-${roleColor[u.role_type]}`}>
                    {u.role_type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card admin-card">
            <h3>Start a new project</h3>
            <div className="admin-form-grid">
              <div>
                <label className="capture-label">Name</label>
                <input className="input" placeholder="Vendor Onboarding Portal"
                  value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div>
                <label className="capture-label">Code (2–10 chars)</label>
                <input className="input" placeholder="VOP" maxLength={10}
                  value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} />
              </div>
            </div>
            <label className="capture-label">Description (optional)</label>
            <textarea className="input" rows={2} placeholder="What this project does"
              value={form.description} onChange={(e) => set('description', e.target.value)} style={{ marginBottom: 12 }} />
            <label className="capture-label">Repo URL (optional)</label>
            <input className="input" placeholder="github.com/org/repo"
              value={form.repo_url} onChange={(e) => set('repo_url', e.target.value)} style={{ marginBottom: 14 }} />
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={!valid || creating} onClick={handleCreate}>
              {creating ? <><span className="spinner" /> Creating…</> : <><i className="ti ti-folder-plus" aria-hidden="true" /> Create project</>}
            </button>
          </div>
        </div>

        <div className="admin-right">
          <div className="card admin-card">
            <h3>System health</h3>
            <div className="admin-health-row">
              <span className="watcher-dot" />
              <span>LLM: <strong>{health.llm}</strong></span>
            </div>
            <div className="admin-health-row">
              <span className="watcher-dot" />
              <span>Ollama: <code className="admin-code">{health.ollama}</code></span>
            </div>

            <div className="admin-storage">
              <div className="admin-storage-label">
                <span>Storage used</span>
                <span>{health.storage_used_mb} / {health.storage_total_mb} MB</span>
              </div>
              <div className="dash-bar-track">
                <div className="dash-bar-fill" style={{
                  width: `${storePct}%`,
                  background: storePct > 80 ? 'var(--danger)' : 'var(--teal)',
                }} />
              </div>
            </div>

            <span className="admin-section-label">Entries per project</span>
            {health.entries_by_project.map((p) => (
              <div key={p.project} className="admin-project-row">
                <span>{p.project}</span>
                <span className="admin-project-count">{p.count}</span>
              </div>
            ))}

            <div className="admin-onprem-badge">
              <span className="watcher-dot" /> Everything stays on this machine
            </div>
          </div>

          <div className="card admin-card">
            <h3>Recent activity</h3>
            <div className="admin-audit-list">
              {health.audit_log.map((log) => (
                <div key={log.id} className="admin-audit-row">
                  <div className="admin-audit-main">
                    <span className="admin-audit-action">{log.action.replace('.', ' · ')}</span>
                    <span className="admin-audit-entity">{log.entity} — {log.user}</span>
                  </div>
                  <span className="admin-audit-time">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
