export default function DuplicateCard({ result, onDone }) {
  return (
    <div className="duplicate-card pop-in">
      <i className="ti ti-users-group dup-icon" aria-hidden="true" />
      <h3>Someone already knew this!</h3>
      <p>
        This matches an existing entry <span className="duplicate-sim">{Math.round(result.similarity * 100)}% similar</span>
        {' '}(<span style={{ fontFamily: 'var(--font-mono)' }}>{result.existing_entry_id}</span>).
      </p>
      <p>Its frequency count just went up — that helps flag recurring problems.</p>
      <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={onDone}>
        Log something else
      </button>
    </div>
  )
}
