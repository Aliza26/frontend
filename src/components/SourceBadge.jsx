const config = {
  audio: { label: 'Voice', icon: 'ti-microphone', color: 'coral' },
  text:  { label: 'Text', icon: 'ti-pencil', color: 'periwinkle' },
  vtt:   { label: 'Meeting', icon: 'ti-video', color: 'teal' },
  code:  { label: 'Code', icon: 'ti-code', color: 'pink' },
  file:  { label: 'File', icon: 'ti-file-description', color: 'amber' },
}

export default function SourceBadge({ source }) {
  const c = config[source] || config.text
  return (
    <span className={`pill source-badge source-${c.color}`}>
      <i className={`ti ${c.icon}`} aria-hidden="true" />
      {c.label}
    </span>
  )
}
