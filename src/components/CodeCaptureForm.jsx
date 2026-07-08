import { useState } from 'react'

const SUBTYPES = [
  { id: 'git_commit',   label: 'Git commit',   icon: 'ti-git-commit' },
  { id: 'code_comment', label: 'Code comment', icon: 'ti-message-code' },
  { id: 'docstring',    label: 'Docstring',    icon: 'ti-file-code' },
  { id: 'readme',       label: 'README',       icon: 'ti-markdown' },
]

export default function CodeCaptureForm({ onSubmit, disabled }) {
  const [subtype, setSubtype] = useState('git_commit')
  const [form, setForm] = useState({
    commit_message: '', diff_summary: '', file_content: '',
    language: 'python', repo_name: '', file_path: '', commit_hash: '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const isCommit = subtype === 'git_commit'
  const valid = isCommit ? form.commit_message.trim().length >= 10 : form.file_content.trim().length >= 20

  return (
    <div>
      <div className="tag-selector-row" style={{ marginBottom: 16 }}>
        {SUBTYPES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`pill tag-pill tag-pink ${subtype === s.id ? 'tag-pill-selected' : ''}`}
            onClick={() => setSubtype(s.id)}
          >
            <i className={`ti ${s.icon}`} aria-hidden="true" />
            {s.label}
          </button>
        ))}
      </div>

      {isCommit ? (
        <>
          <label className="capture-label">Commit message</label>
          <input className="input" placeholder="fix: normalize settlement timezone to UTC before diffing"
            value={form.commit_message} onChange={(e) => set('commit_message', e.target.value)} style={{ marginBottom: 12 }} />
          <label className="capture-label">What changed (optional)</label>
          <textarea className="input" rows={2} placeholder="Changed reconcile.py to convert timestamps via pytz before comparison"
            value={form.diff_summary} onChange={(e) => set('diff_summary', e.target.value)} style={{ marginBottom: 12 }} />
        </>
      ) : (
        <>
          <label className="capture-label">Paste the {subtype === 'readme' ? 'markdown' : 'code'}</label>
          <textarea className="input" rows={5} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12 }}
            placeholder={subtype === 'code_comment' ? '# TODO: this retry loop has no backoff, will hammer the gateway…' : subtype === 'docstring' ? 'def reconcile(...):\n    """Reconciles settlement files, assumes UTC input."""' : '# CPR Service\n\nThis service reconciles…'}
            value={form.file_content} onChange={(e) => set('file_content', e.target.value)} />
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <label className="capture-label">Repo (optional)</label>
          <input className="input" placeholder="billing-os" value={form.repo_name} onChange={(e) => set('repo_name', e.target.value)} />
        </div>
        <div>
          <label className="capture-label">File path (optional)</label>
          <input className="input" placeholder="src/reconcile.py" value={form.file_path} onChange={(e) => set('file_path', e.target.value)} />
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%' }} disabled={disabled || !valid}
        onClick={() => onSubmit({ subtype, ...form })}>
        <i className="ti ti-sparkles" aria-hidden="true" /> Save this knowledge
      </button>
    </div>
  )
}
