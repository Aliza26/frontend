import { useEffect, useState } from 'react'

export default function ConfidenceBar({ value, compact = false }) {
  const [width, setWidth] = useState(0)
  const pct = Math.round(value * 100)

  const tone = pct >= 80
    ? { label: 'Pretty confident', color: 'var(--success)' }
    : pct >= 55
    ? { label: 'Worth a quick look', color: 'var(--warning)' }
    : { label: 'Not so sure about this one', color: 'var(--danger)' }

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="confidence-bar-wrap">
      {!compact && (
        <div className="confidence-bar-label">
          <span style={{ color: tone.color, fontWeight: 700 }}>{tone.label}</span>
          <span className="confidence-bar-pct">{pct}%</span>
        </div>
      )}
      <div className="confidence-bar-track">
        <div className="confidence-bar-fill" style={{ width: `${width}%`, background: tone.color }} />
      </div>
    </div>
  )
}
