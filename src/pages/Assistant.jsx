import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import CitationCard from '../components/CitationCard'
import api from '../api'
import '../styles/Assistant.css'

function AgentMessage({ msg, employeeId }) {
  return (
    <div className="chat-row chat-row-agent fade-in-up">
      <div className="chat-avatar"><i className="ti ti-bulb" aria-hidden="true" /></div>
      <div className="chat-bubble-col">
        <div className="chat-bubble chat-bubble-agent"><p>{msg.answer}</p></div>
        {msg.sources?.length > 0 && (
          <div className="chat-citations">
            <span className="chat-citations-label">
              Based on {msg.sources.length} thing{msg.sources.length > 1 ? 's' : ''} the team knows
            </span>
            {msg.sources.map((c, i) => (
              <CitationCard key={c.entry_id} citation={c} index={i} employeeId={employeeId} />
            ))}
          </div>
        )}
        {msg.sources?.length === 0 && (
          <p className="chat-no-sources">
            <i className="ti ti-info-circle" aria-hidden="true" /> Nothing captured on this yet — worth asking your tech lead, and check back once more entries land.
          </p>
        )}
      </div>
    </div>
  )
}

export default function Assistant() {
  const { user } = useSelector((state) => state.auth)
  const { activeProjectId, projects } = useSelector((state) => state.project)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState('project')
  const [suggestions, setSuggestions] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => { api.getSuggestedQuestions().then(setSuggestions) }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const activeProject = projects.find((p) => p.id === activeProjectId)

  const send = async (q) => {
    if (!q.trim() || loading) return
    setMessages((prev) => [...prev, { type: 'user', text: q }])
    setInput(''); setLoading(true)
    const res = await api.askAssistant({
      question: q,
      employee_id: user.id,
      project_id: scope === 'project' ? activeProjectId : undefined,
      n_results: 3,
    })
    setMessages((prev) => [...prev, { type: 'agent', ...res }])
    setLoading(false)
  }

  const firstName = user.name.split(' ')[0]

  return (
    <div className="assistant-page">
      <div className="assistant-sidebar">
        <h3>What's in here</h3>
        <p className="assistant-sidebar-sub">Everything the team has captured so far — go ahead and ask.</p>

        <div className="assistant-suggestions">
          {suggestions.map((q) => (
            <button key={q} className="assistant-suggestion-chip" onClick={() => send(q)}>{q}</button>
          ))}
        </div>

        <div className="assistant-legend">
          <span className="assistant-legend-title">Where answers come from</span>
          {[
            ['coral', 'Voice notes'], ['periwinkle', 'Written notes'],
            ['pink', 'Code comments'], ['teal', 'Meetings'], ['amber', 'Documents'],
          ].map(([color, label]) => (
            <div key={label} className="assistant-legend-row">
              <span className="legend-dot" style={{ background: `var(--${color})` }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="assistant-chat">
        <div className="assistant-chat-header">
          <div className="chat-avatar"><i className="ti ti-bulb" aria-hidden="true" /></div>
          <div className="assistant-chat-title">
            <span>Dev Assistant</span>
            <span className="assistant-chat-sub">Llama 3.1 8B · on-premise · cited answers</span>
          </div>
          <div className="assistant-scope-toggle">
            <button className={scope === 'project' ? 'active' : ''} onClick={() => setScope('project')}>
              {activeProject?.name || 'This project'}
            </button>
            <button className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>
              Everything I can see
            </button>
          </div>
        </div>

        <div className="assistant-chat-messages">
          {messages.length === 0 && (
            <div className="assistant-welcome fade-in-up">
              <div className="assistant-welcome-icon"><i className="ti ti-hand-stop" aria-hidden="true" /></div>
              <h2>Hey {firstName} 👋</h2>
              <p>Ask me anything about the codebase — I'll pull from what your team has already figured out, with sources attached.</p>
            </div>
          )}

          {messages.map((msg, i) =>
            msg.type === 'user' ? (
              <div key={i} className="chat-row chat-row-user fade-in-up">
                <div className="chat-bubble chat-bubble-user">{msg.text}</div>
              </div>
            ) : (
              <AgentMessage key={i} msg={msg} employeeId={user.id} />
            )
          )}

          {loading && (
            <div className="chat-row chat-row-agent fade-in-up">
              <div className="chat-avatar"><i className="ti ti-bulb" aria-hidden="true" /></div>
              <div className="loading-pulse">
                <div className="loading-pulse-dots"><span /><span /><span /></div>
                <span className="loading-pulse-text">Looking through what the team knows…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="assistant-input-bar">
          <input
            className="input assistant-input"
            placeholder="Ask about a bug, a deployment, anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
          />
          <button className="btn btn-primary assistant-send" onClick={() => send(input)}
            disabled={!input.trim() || loading} aria-label="Send">
            <i className="ti ti-send" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
