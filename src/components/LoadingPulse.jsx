export default function LoadingPulse({ message = 'Working on it…', steps = [] }) {
  return (
    <div className="fade-in-up">
      <div className="loading-pulse">
        <div className="loading-pulse-dots"><span /><span /><span /></div>
        <span className="loading-pulse-text">{message}</span>
      </div>
      {steps.length > 0 && (
        <div className="loading-steps">
          {steps.map((s, i) => (
            <div key={s} className="loading-step fade-in-up" style={{ animationDelay: `${i * 0.12}s` }}>
              <span className="shimmer-block" />
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
