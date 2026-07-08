import { useState, useRef } from 'react'

const TYPE_ICONS = { pdf: 'ti-file-type-pdf', docx: 'ti-file-type-docx', txt: 'ti-file-text', csv: 'ti-table', vtt: 'ti-video', eml: 'ti-mail' }

export default function FileDropZone({ accept, maxMB, types, file, onFile }) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!types.includes(ext)) {
      setError(`That file type isn't supported here — try one of: ${types.join(', ')}`)
      return
    }
    if (f.size > maxMB * 1024 * 1024) {
      setError(`That file is a bit too big — the limit is ${maxMB} MB`)
      return
    }
    setError('')
    onFile(f)
  }

  const ext = file?.name.split('.').pop().toLowerCase()

  return (
    <div>
      {!file ? (
        <div
          className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        >
          <i className="ti ti-cloud-upload" aria-hidden="true" />
          <div style={{ fontSize: 14, fontWeight: 600 }}>Drop your file here, or click to browse</div>
          <div className="file-drop-types">
            {types.map((t) => <span key={t}>{t.toUpperCase()}</span>)}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="file-preview-card fade-in-up">
          <div className="file-preview-icon"><i className={`ti ${TYPE_ICONS[ext] || 'ti-file'}`} aria-hidden="true" /></div>
          <div className="file-preview-info">
            <div className="file-preview-name">{file.name}</div>
            <div className="file-preview-size">{(file.size / 1024).toFixed(0)} KB</div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px 14px' }} onClick={() => onFile(null)}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
      )}
      {error && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>{error}</p>}
    </div>
  )
}
