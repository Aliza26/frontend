import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setActiveProject } from '../store/slices/projectSlice'

export default function ProjectSwitcher() {
  const { projects, activeProjectId } = useSelector((state) => state.project)
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const active = projects.find((p) => p.id === activeProjectId)
  if (!active) return null

  return (
    <div className="project-switcher" ref={ref}>
      <button className="project-switcher-btn" onClick={() => setOpen((v) => !v)}>
        <i className="ti ti-folder" aria-hidden="true" />
        <span className="project-switcher-name">{active.name}</span>
        <i className={`ti ti-chevron-${open ? 'up' : 'down'}`} aria-hidden="true" style={{ marginLeft: 'auto', fontSize: 12 }} />
      </button>
      {open && (
        <div className="project-switcher-menu fade-in-up">
          {projects.map((p) => (
            <button
              key={p.id}
              className={`project-switcher-item ${p.id === activeProjectId ? 'active' : ''}`}
              onClick={() => { dispatch(setActiveProject(p.id)); setOpen(false) }}
            >
              <span>{p.name}</span>
              <span className="project-switcher-code">{p.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
