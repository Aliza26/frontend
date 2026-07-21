import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { markTicketResolved } from '../store/slices/ticketsSlice'
import ConfidenceBar from '../components/ConfidenceBar'
import { useToast } from '../components/Toast'
import api from '../api'
import '../styles/Assistant.css'
import '../styles/Capture.css'
import '../styles/Tickets.css'

const priorityColor = { High: 'pink', Medium: 'amber', Low: 'teal' }

export default function SolveTicket() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { addToast } = useToast()
  const { user } = useSelector((state) => state.auth)
  const { activeProjectId } = useSelector((state) => state.project)

  const [ticket, setTicket] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [messages, setMessages] = useState([])   // [{role: 'user'|'assistant', content}]
  const [phase, setPhase] = useState('solving')  // 'solving' | 'reflection'
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [result, setResult] = useState(null)     // CaptureOut-shaped response
  const [edited, setEdited] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.getTicket(ticketId).then((t) => (t ? setTicket(t) : setNotFound(true)))
  }, [ticketId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending, result])

  const hasExchange = messages.some((m) => m.role === 'assistant')
  const reflectionReplies = phase === 'reflection' ? messages.filter((m) => m.role === 'assistant').length : 0
  const canCapture = phase === 'reflection' && reflectionReplies >= 1 && !result

  const sendTurn = async (messageText, nextPhase = phase) => {
    setSending(true)
    const userTurn = { role: 'user', content: messageText }
    const historyForCall = messages
    setMessages((prev) => [...prev, userTurn])
    const res = await api.ticketChat(ticketId, { message: messageText, phase: nextPhase, history: historyForCall })
    setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }])
    setSending(false)
  }

  const handleSend = () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    sendTurn(text, phase)
  }

  const handleMarkResolved = () => {
    if (sending) return
    setPhase('reflection')
    sendTurn("I've fixed it — marking this ticket resolved.", 'reflection')
  }

  const handleCapture = async () => {
    setCapturing(true)
    const transcript = messages.map(({ role, content }) => ({ role, content }))
    const res = await api.ticketCapture(ticketId, {
      employee_id: user.id,
      project_id: activeProjectId,
      transcript,
    })
    setResult(res)
    setEdited(res.extracted || null)
    setCapturing(false)
  }

  const handleConfirmSave = () => {
    dispatch(markTicketResolved(ticketId))
    addToast('Saved to the knowledge base')
    navigate('/tickets')
  }

  if (notFound) {
    return (
      <div className="tickets-page">
        <p>Ticket not found. <Link to="/tickets">Back to My Tickets</Link></p>
      </div>
    )
  }
  if (!ticket) return null

  return (
    <div className="tickets-page solve-ticket-page">
      <Link to="/tickets" className="solve-back-link">
        <i className="ti ti-arrow-left" aria-hidden="true" /> My Tickets
      </Link>

      <div className="card solve-ticket-header">
        <div className="ticket-card-top">
          <span className="ticket-id">{ticket.id}</span>
          <span className={`pill tag-pill tag-${priorityColor[ticket.priority] || 'periwinkle'}`}>
            {ticket.priority}
          </span>
        </div>
        <h2>{ticket.title}</h2>
        <p className="ticket-desc">{ticket.description}</p>
      </div>

      <div className="card solve-chat-card">
        <div className="solve-chat-phase">
          <i className={`ti ${phase === 'solving' ? 'ti-tool' : 'ti-bulb'}`} aria-hidden="true" />
          {phase === 'solving' ? 'Solving with KTHub' : 'Reflecting on the fix'}
        </div>

        <div className="solve-chat-messages">
          {messages.length === 0 && (
            <div className="solve-chat-welcome">
              <i className="ti ti-message-2-bolt" aria-hidden="true" />
              <p>Tell KTHub what you're seeing, and work through it together.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`chat-row ${m.role === 'user' ? 'chat-row-user' : 'chat-row-agent'} fade-in-up`}>
              {m.role === 'assistant' && (
                <div className="chat-avatar chat-avatar-logo"><i className="ti ti-sparkles" aria-hidden="true" /></div>
              )}
              <div className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'}`}>
                {m.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="chat-row chat-row-agent fade-in-up">
              <div className="chat-avatar chat-avatar-logo"><i className="ti ti-sparkles" aria-hidden="true" /></div>
              <div className="chat-bubble chat-bubble-agent solve-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {!result && (
          <div className="solve-input-bar">
            <input
              className="input"
              placeholder={phase === 'solving' ? "Describe what you're seeing…" : 'Answer KTHub’s question…'}
              value={input}
              disabled={sending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim() || sending} aria-label="Send">
              <i className="ti ti-send" aria-hidden="true" />
            </button>
          </div>
        )}

        {!result && (
          <div className="solve-chat-actions">
            {phase === 'solving' && hasExchange && (
              <button className="btn btn-secondary" onClick={handleMarkResolved} disabled={sending}>
                <i className="ti ti-check" aria-hidden="true" /> Mark as Resolved
              </button>
            )}
            {canCapture && (
              <button className="btn btn-primary" onClick={handleCapture} disabled={capturing}>
                {capturing
                  ? <><span className="spinner" /> Capturing…</>
                  : <><i className="ti ti-sparkles" aria-hidden="true" /> Capture to Knowledge Base</>}
              </button>
            )}
          </div>
        )}
      </div>

      {result && result.status === 'created' && edited && (
        <div className="card capture-card fade-in-up">
          <div className="capture-result-header">
            <h3>Here's what I got</h3>
            <span className="pill source-badge source-periwinkle">
              <i className="ti ti-ticket" aria-hidden="true" /> Ticket chat
            </span>
          </div>

          <div className="capture-field">
            <label>The problem</label>
            <textarea className="input" rows={2} value={edited.problem_summary}
              onChange={(e) => setEdited({ ...edited, problem_summary: e.target.value })} />
          </div>
          <div className="capture-field">
            <label>Why it happened</label>
            <textarea className="input" rows={3} value={edited.root_cause || ''}
              onChange={(e) => setEdited({ ...edited, root_cause: e.target.value })} />
          </div>
          <div className="capture-field">
            <label>How it was fixed</label>
            {(edited.solution_steps || []).map((step, i) => (
              <div key={i} className="capture-step-row">
                <span className="capture-step-circle">{i + 1}</span>
                <textarea className="input" rows={1} value={step}
                  onChange={(e) => {
                    const steps = [...edited.solution_steps]
                    steps[i] = e.target.value
                    setEdited({ ...edited, solution_steps: steps })
                  }} />
              </div>
            ))}
          </div>

          {edited.alternatives_considered?.length > 0 && (
            <div className="capture-field">
              <label>Considered and rejected</label>
              {edited.alternatives_considered.map((alt, i) => (
                <div key={i} className="solve-alternative-row">
                  <i className="ti ti-arrow-back-up" aria-hidden="true" />
                  <div>
                    <strong>{alt.approach}</strong>
                    <p>{alt.why_rejected}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="capture-tags-row">
            {(edited.tags || []).map((t) => (
              <span key={t} className="pill tag-pill tag-periwinkle tag-pill-selected">{t}</span>
            ))}
          </div>

          <ConfidenceBar value={result.confidence_score} />
          {result.needs_review && (
            <p className="capture-review-note">
              <i className="ti ti-eye" aria-hidden="true" /> Below the 0.75 threshold — a tech lead will double-check this one.
            </p>
          )}

          <div className="capture-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/tickets')}>Never mind</button>
            <button className="btn btn-primary" onClick={handleConfirmSave}>
              <i className="ti ti-check" aria-hidden="true" /> Looks good, save it
            </button>
          </div>
        </div>
      )}

      {result && result.status === 'duplicate' && (
        <div className="card capture-card fade-in-up">
          <h3>Similar knowledge already exists</h3>
          <p>{result.message}</p>
          <div className="capture-actions">
            <button className="btn btn-primary" onClick={handleConfirmSave}>Okay</button>
          </div>
        </div>
      )}

      {result && result.status === 'rejected' && (
        <div className="card capture-rejected fade-in-up">
          <i className="ti ti-shield-x" aria-hidden="true" />
          <h3>The privacy gate stepped in</h3>
          <p>{result.message}</p>
          <div className="capture-rejected-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/tickets')}>Okay</button>
          </div>
        </div>
      )}
    </div>
  )
}
