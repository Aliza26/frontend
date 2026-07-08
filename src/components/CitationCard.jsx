import SourceBadge from './SourceBadge'
import StarRating from './StarRating'

export default function CitationCard({ citation, index, employeeId }) {
  return (
    <div className="citation-card fade-in-up" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="citation-top">
        <span className="citation-index">[{index + 1}] {citation.entry_id}</span>
        <SourceBadge source={citation.source_type} />
        {citation.frequency_seen >= 5 && (
          <span className="fire-chip"><i className="ti ti-flame" aria-hidden="true" /> {citation.frequency_seen}×</span>
        )}
        <span className="citation-sim">{Math.round(citation.similarity * 100)}% match</span>
      </div>
      <p className="citation-summary">{citation.problem_summary}</p>
      <div className="citation-footer">
        <span>via <strong>{citation.employee || citation.team}</strong> · {citation.capture_date?.slice(0, 10)}</span>
        <StarRating entryId={citation.entry_id} employeeId={employeeId} />
      </div>
    </div>
  )
}
