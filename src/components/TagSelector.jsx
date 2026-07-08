import { useEffect, useState } from 'react'
import api from '../api'

export default function TagSelector({ selected, onSelect }) {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [custom, setCustom] = useState('')

  useEffect(() => {
    api.getTags().then((d) => { setTags(d); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="tag-selector-row">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="shimmer-block" style={{ width: 70 + (i % 3) * 22, height: 32, borderRadius: 99 }} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="tag-selector-row">
        {tags.map((tag) => {
          const isSelected = selected?.id === tag.id
          return (
            <button
              key={tag.id}
              type="button"
              className={`pill tag-pill tag-${tag.color} ${isSelected ? 'tag-pill-selected' : ''}`}
              onClick={() => onSelect(isSelected ? null : tag)}
            >
              <i className={`ti ${tag.icon}`} aria-hidden="true" />
              {tag.label}
            </button>
          )
        })}
      </div>
      {selected?.id === 'other' && (
        <input
          className="input fade-in-up"
          style={{ marginTop: 12 }}
          maxLength={30}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="What kind of thing was it?"
        />
      )}
    </div>
  )
}
