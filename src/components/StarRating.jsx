import { useState } from 'react'
import api from '../api'

export default function StarRating({ entryId, employeeId }) {
  const [hover, setHover] = useState(0)
  const [rated, setRated] = useState(0)

  const rate = async (n) => {
    setRated(n)
    try { await api.rateEntry(entryId, n, employeeId) } catch { /* mock never fails */ }
  }

  return (
    <span className="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn ${(hover || rated) >= n ? 'star-filled' : ''}`}
          onMouseEnter={() => !rated && setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !rated && rate(n)}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          <i className={`ti ${(hover || rated) >= n ? 'ti-star-filled' : 'ti-star'}`} aria-hidden="true" />
        </button>
      ))}
      {rated > 0 && <span className="star-rating-thanks">Thanks, noted</span>}
    </span>
  )
}
