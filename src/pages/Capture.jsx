import { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import TagSelector from '../components/TagSelector'
import FileWatcherStrip from '../components/FileWatcherStrip'
import ConfidenceBar from '../components/ConfidenceBar'
import LoadingPulse from '../components/LoadingPulse'
import SourceBadge from '../components/SourceBadge'
import FileDropZone from '../components/FileDropZone'
import CodeCaptureForm from '../components/CodeCaptureForm'
import DuplicateCard from '../components/DuplicateCard'
import { useToast } from '../components/Toast'
import api from '../api'
import '../styles/Capture.css'

const STATES = { IDLE: 'idle', RECORDING: 'recording', EXTRACTING: 'extracting', RESULT: 'result', DUPLICATE: 'duplicate', REJECTED: 'rejected', SAVING: 'saving', DONE: 'done' }
const MIN_DURATION = 2
const SIGNAL_WORDS = ['problem', 'issue', 'error', 'bug', 'fix', 'fail', 'broke', 'wrong', 'not working', 'cause', 'crash']

const TABS = [
  { id: 'voice', label: 'Voice', icon: 'ti-microphone' },
  { id: 'text', label: 'Type it', icon: 'ti-pencil' },
  { id: 'file', label: 'File', icon: 'ti-upload' },
  { id: 'code', label: 'Code', icon: 'ti-code' },
  { id: 'vtt', label: 'Meeting', icon: 'ti-video' },
]

const EXTRACT_STEPS = {
  voice: ['Transcribing with Whisper (locally)', 'Finding the problem and root cause', 'Pulling out the solution steps', 'Scoring confidence'],
  text: ['Reading through what you wrote', 'Finding the problem and root cause', 'Pulling out the solution steps'],
  file: ['Extracting text from the file', 'Finding the useful knowledge', 'Scoring confidence'],
  code: ['Reading the code context', 'Working out what it means for the next dev', 'Scoring confidence'],
  vtt: ['Cleaning up the transcript', 'Finding decisions and fixes discussed', 'Scoring confidence'],
}

export default function Capture() {
  const { user } = useSelector((state) => state.auth)
  const { activeProjectId } = useSelector((state) => state.project)
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [tag, setTag] = useState(null)
  const [tab, setTab] = useState('voice')
  const [state, setState] = useState(STATES.IDLE)
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [vttFile, setVttFile] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [voiceHint, setVoiceHint] = useState('')
  const [textHint, setTextHint] = useState('')
  const [result, setResult] = useState(null)
  const [edited, setEdited] = useState(null)
  const timerRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  const isLocked = !tag
  const base = { project_id: activeProjectId, employee_id: user.id, tag: tag?.id }

  const handleOutcome = (data) => {
    setResult(data)
    if (data.status === 'created') {
      setEdited(data.extracted)
      setState(STATES.RESULT)
    } else if (data.status === 'duplicate') {
      setState(STATES.DUPLICATE)
    } else {
      setState(STATES.REJECTED)
    }
  }

  const startRec = async () => {
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setVoiceHint("Couldn't access your microphone — check the browser's permission prompt and try again.")
      return
    }
    streamRef.current = stream
    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    chunksRef.current = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.start()
    mediaRecorderRef.current = recorder

    setState(STATES.RECORDING); setSeconds(0); setVoiceHint('')
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  const stopRec = async () => {
    clearInterval(timerRef.current)

    const recorder = mediaRecorderRef.current
    const blob = await new Promise((resolve) => {
      if (!recorder) return resolve(null)
      recorder.onstop = () => resolve(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }))
      recorder.stop()
    })
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    mediaRecorderRef.current = null

    if (seconds < MIN_DURATION) {
      setVoiceHint(`Hmm, that felt a bit short — got ${MIN_DURATION - seconds} more seconds in you? Describe what broke, why, and how you fixed it.`)
      setState(STATES.IDLE)
      return
    }
    if (!blob || blob.size === 0) {
      setVoiceHint("Didn't catch any audio — please try recording again.")
      setState(STATES.IDLE)
      return
    }

    const ext = blob.type.includes('ogg') ? 'ogg' : 'webm'
    const audio_file = new File([blob], `voice-note.${ext}`, { type: blob.type })
    setState(STATES.EXTRACTING)
    handleOutcome(await api.captureAudio({ ...base, audio_file }))
  }

  const submitText = async () => {
    if (text.trim().length < 20) { setTextHint('A few more details would help — the model needs at least a sentence or two.'); return }
    if (!SIGNAL_WORDS.some((w) => text.toLowerCase().includes(w))) {
      setTextHint('Tip: mentioning what went wrong helps me extract this better.')
    } else setTextHint('')
    setState(STATES.EXTRACTING)
    handleOutcome(await api.captureText({ ...base, text }))
  }

  const submitFile = async () => {
    setState(STATES.EXTRACTING)
    handleOutcome(await api.captureFile({ ...base, document: file, file_content: file?.name }))
  }

  const submitVtt = async () => {
    setState(STATES.EXTRACTING)
    handleOutcome(await api.captureVtt({ ...base, vtt_file: vttFile }))
  }

  const submitCode = async (codeForm) => {
    setState(STATES.EXTRACTING)
    handleOutcome(await api.captureCode({ ...base, ...codeForm }))
  }

  const handleSave = async () => {
    setState(STATES.SAVING)
    await new Promise((r) => setTimeout(r, 600))
    addToast('Saved to the knowledge base')
    setState(STATES.DONE)
  }

  const reset = () => {
    setState(STATES.IDLE); setText(''); setFile(null); setVttFile(null)
    setResult(null); setEdited(null); setVoiceHint(''); setTextHint(''); setSeconds(0)
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (state === STATES.DONE) {
    return (
      <div className="capture-page">
        <div className="capture-done-card card pop-in">
          <div className="capture-done-check"><i className="ti ti-check" aria-hidden="true" /></div>
          <h2>Got it, saved!</h2>
          <p className="capture-done-id">Entry <code>{result?.entry_id}</code></p>
          {result?.needs_review && (
            <p className="capture-done-review">
              <i className="ti ti-eye" aria-hidden="true" /> Confidence was a little low, so a tech lead will give it a quick look.
            </p>
          )}
          <p className="capture-done-sub">Whoever joins next will see this on day one.</p>
          <button className="btn btn-primary" onClick={reset}>Log something else</button>
        </div>
      </div>
    )
  }

  return (
    <div className="capture-page">
     <div className="page-header">
        <h1>KTCap · What did you just fix?</h1>
        <p>A two-minute habit that saves the next person weeks.</p>
      </div>

      <div className="capture-grid">
        <div className="capture-main">

          <div className={`card capture-card ${!tag ? 'capture-card-glow' : ''}`}>
            <div className="capture-step-header">
              <div className={`capture-step-num ${tag ? 'capture-step-done' : ''}`}>
                {tag ? <i className="ti ti-check" aria-hidden="true" /> : '1'}
              </div>
              <span>What kind of thing was it?</span>
              {!tag
                ? <span className="capture-step-note pulse">Pick one to unlock capture</span>
                : <span className="capture-step-note unlocked"><i className="ti ti-lock-open" aria-hidden="true" /> Capture unlocked</span>}
            </div>
            <TagSelector selected={tag} onSelect={setTag} />
          </div>

          <div className={`card capture-card ${isLocked ? 'capture-card-locked' : ''}`}>
            <div className="capture-step-header">
              <div className={`capture-step-num ${isLocked ? '' : 'capture-step-active'}`}>
                {isLocked ? <i className="ti ti-lock" aria-hidden="true" /> : '2'}
              </div>
              <span>{isLocked ? 'Pick something above first' : 'Tell me about it'}</span>
            </div>

            <div className="capture-tabs">
              {TABS.map((t) => (
                <button key={t.id}
                  className={`capture-tab ${tab === t.id ? 'capture-tab-active' : ''}`}
                  onClick={() => { setTab(t.id); setVoiceHint(''); setTextHint('') }}>
                  <i className={`ti ${t.icon}`} aria-hidden="true" /> {t.label}
                </button>
              ))}
            </div>

            {state === STATES.EXTRACTING ? (
              <LoadingPulse message="Llama is thinking, locally…" steps={EXTRACT_STEPS[tab]} />
            ) : (
              <>
                {tab === 'voice' && (
                  <div>
                    <div className="capture-guide">
                      <i className="ti ti-bulb" aria-hidden="true" />
                      <span>Describe <strong>what broke</strong> → <strong>why it happened</strong> → <strong>how you fixed it.</strong> Aim for 15–30 seconds.</span>
                    </div>
                    {voiceHint && (
                      <div className="capture-hint shake">
                        <i className="ti ti-mood-confuzed" aria-hidden="true" /> {voiceHint}
                      </div>
                    )}
                    <div className="capture-mic-zone">
                      <button
                        className={`capture-mic-btn ${state === STATES.RECORDING ? 'recording' : ''}`}
                        onClick={state === STATES.RECORDING ? stopRec : startRec}
                        disabled={isLocked}
                        aria-label={state === STATES.RECORDING ? 'Stop recording' : 'Start recording'}
                      >
                        {state === STATES.RECORDING && <span className="capture-mic-pulse" />}
                        <i className={`ti ${state === STATES.RECORDING ? 'ti-player-stop-filled' : 'ti-microphone'}`} aria-hidden="true" />
                      </button>
                      {state === STATES.RECORDING ? (
                        <>
                          <span className="capture-rec-time">{fmt(seconds)}</span>
                          <div className="capture-waveform">
                            {[...Array(18)].map((_, i) => (
                              <span key={i} style={{ animationDelay: `${i * 0.07}s`, height: `${10 + ((i * 13) % 20)}px` }} />
                            ))}
                          </div>
                          <p className="capture-mic-hint">
                            {seconds < MIN_DURATION ? `Keep going — ${MIN_DURATION - seconds}s more` : 'Nice, tap stop whenever'}
                          </p>
                        </>
                      ) : (
                        <p className="capture-mic-hint">Click to start recording · minimum 8 seconds · Whisper transcribes locally</p>
                      )}
                    </div>
                  </div>
                )}

                {tab === 'text' && (
                  <div>
                    <textarea className="input capture-textarea" rows={6}
                      placeholder="Like: the export kept failing silently until I found the row limit…"
                      value={text} disabled={isLocked}
                      onChange={(e) => { setText(e.target.value); setTextHint('') }} />
                    <div className="capture-text-meta">
                      {textHint ? <span className="capture-text-hint">{textHint}</span> : <span />}
                      <span className={`capture-char-count ${text.length < 20 ? 'low' : 'ok'}`}>{text.length} chars</span>
                    </div>
                    <button className="btn btn-primary capture-submit" disabled={isLocked || text.trim().length < 20} onClick={submitText}>
                      <i className="ti ti-sparkles" aria-hidden="true" /> Save this knowledge
                    </button>
                  </div>
                )}

                {tab === 'file' && (
                  <div>
                    <FileDropZone
                      accept=".pdf,.docx,.txt,.csv,.eml"
                      maxMB={20}
                      types={['pdf', 'docx', 'txt', 'csv', 'eml']}
                      file={file}
                      onFile={setFile}
                    />
                    {file && (
                      <button className="btn btn-primary capture-submit" onClick={submitFile}>
                        <i className="ti ti-sparkles" aria-hidden="true" /> Read this file for knowledge
                      </button>
                    )}
                  </div>
                )}

                {tab === 'code' && (
                  <CodeCaptureForm onSubmit={submitCode} disabled={isLocked} />
                )}

                {tab === 'vtt' && (
                  <div>
                    <div className="capture-guide">
                      <i className="ti ti-bulb" aria-hidden="true" />
                      <span>Drop a Teams meeting transcript (.vtt) — one meeting can produce several knowledge entries.</span>
                    </div>
                    <FileDropZone
                      accept=".vtt"
                      maxMB={20}
                      types={['vtt']}
                      file={vttFile}
                      onFile={setVttFile}
                    />
                    {vttFile && (
                      <button className="btn btn-primary capture-submit" onClick={submitVtt}>
                        <i className="ti ti-sparkles" aria-hidden="true" /> Mine this meeting for knowledge
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {state === STATES.RESULT && edited && (
            <div className="card capture-card fade-in-up">
              <div className="capture-result-header">
                <h3>Here's what I got</h3>
                <div className="capture-result-badges">
                  <SourceBadge source={tab === 'voice' ? 'audio' : tab} />
                  {tag && (
                    <span className={`pill tag-pill tag-${tag.color} tag-pill-selected`}>
                      <i className={`ti ${tag.icon}`} aria-hidden="true" /> {tag.label}
                    </span>
                  )}
                </div>
              </div>

              {result.transcription && (
                <div className="capture-transcription">
                  <i className="ti ti-quote" aria-hidden="true" />
                  <span>"{result.transcription}"</span>
                </div>
              )}

              <div className="capture-field">
                <label>The problem</label>
                <textarea className="input" rows={2} value={edited.problem_summary}
                  onChange={(e) => setEdited({ ...edited, problem_summary: e.target.value })} />
              </div>
              <div className="capture-field">
                <label>Why it happened</label>
                <textarea className="input" rows={3} value={edited.root_cause}
                  onChange={(e) => setEdited({ ...edited, root_cause: e.target.value })} />
              </div>
              <div className="capture-field">
                <label>How it was fixed</label>
                {edited.solution_steps.map((step, i) => (
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

              <div className="capture-tags-row">
                {edited.tags.map((t) => (
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
                <button className="btn btn-secondary" onClick={reset}>Never mind</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={state === STATES.SAVING}>
                  {state === STATES.SAVING
                    ? <><span className="spinner" /> Saving…</>
                    : <><i className="ti ti-check" aria-hidden="true" /> Looks good, save it</>}
                </button>
              </div>
            </div>
          )}

          {state === STATES.DUPLICATE && result && (
            <DuplicateCard result={result} onDone={reset} />
          )}

          {state === STATES.REJECTED && result && (
            <div className="card capture-rejected fade-in-up">
              <i className="ti ti-shield-x" aria-hidden="true" />
              <h3>The privacy gate stepped in</h3>
              <p>{result.message}</p>
              <div className="capture-rejected-actions">
                <button className="btn btn-secondary" onClick={reset}>Okay</button>
                <button className="btn btn-primary" onClick={() => navigate('/consent')}>
                  <i className="ti ti-toggle-right" aria-hidden="true" /> Open consent settings
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="capture-side">
          <FileWatcherStrip />
          <div className="card capture-stats-card">
            <div className="capture-stats-title">Your captures</div>
            {[
              { label: 'This week', value: '3', color: 'var(--periwinkle-dark)' },
              { label: 'Total', value: '12', color: 'var(--text-primary)' },
              { label: 'Confirmed', value: '9', color: 'var(--success)' },
            ].map((s) => (
              <div key={s.label} className="capture-stats-row">
                <span>{s.label}</span>
                <span className="capture-stats-value" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
