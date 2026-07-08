export default function ConsentToggleCard({ icon, title, text, value, onToggle }) {
  return (
    <div className={`consent-card ${value ? 'consent-on' : ''}`}>
      <div className="consent-icon"><i className={`ti ${icon}`} aria-hidden="true" /></div>
      <div className="consent-info">
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
      <button
        type="button"
        className={`consent-toggle ${value ? 'on' : ''}`}
        onClick={onToggle}
        aria-label={`${value ? 'Disable' : 'Enable'} ${title}`}
      />
    </div>
  )
}
