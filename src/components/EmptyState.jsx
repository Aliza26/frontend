export default function EmptyState({ icon = 'ti-mood-empty', title, text, action, onAction }) {
  return (
    <div className="empty-state fade-in-up">
      <i className={`ti ${icon}`} aria-hidden="true" />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <button className="btn btn-primary" onClick={onAction}>{action}</button>}
    </div>
  )
}
