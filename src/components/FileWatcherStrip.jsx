import { useEffect, useState } from 'react'
import api from '../api'

export default function FileWatcherStrip() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    api.getWatcherStatus().then(setStatus)
    const interval = setInterval(() => api.getWatcherStatus().then(setStatus), 20000)
    return () => clearInterval(interval)
  }, [])

  if (!status) return <div className="shimmer-block" style={{ height: 52, borderRadius: 16 }} />

  return (
    <div className="watcher-strip fade-in-up">
      <span className="watcher-dot" />
      <i className="ti ti-folder-open" aria-hidden="true" />
      <span>
        Also keeping an eye on <code>{status.path}</code> — {status.todayCount} file{status.todayCount !== 1 ? 's' : ''} came in today
      </span>
      {status.recentFiles?.[0] && (
        <span className="watcher-last">most recent: {status.recentFiles[0].name}</span>
      )}
    </div>
  )
}
