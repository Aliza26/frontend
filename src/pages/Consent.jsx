import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { updateConsent } from '../store/slices/authSlice'
import ConsentToggleCard from '../components/ConsentToggleCard'
import api from '../api'
import '../styles/Auth.css'

const METHODS = [
  { key: 'consent_audio', icon: 'ti-microphone', title: 'Voice notes',
    text: "Speak a quick note after fixing something — it's transcribed locally and turned into a knowledge entry." },
  { key: 'consent_file', icon: 'ti-file-description', title: 'Documents',
    text: 'Files you share (PDF, Word, text) get read for useful knowledge. Nothing is sent anywhere external.' },
  { key: 'consent_transcript', icon: 'ti-video', title: 'Meeting transcripts',
    text: 'Teams meeting transcripts get mined for decisions and fixes discussed out loud.' },
  { key: 'consent_code', icon: 'ti-code', title: 'Source code',
    text: 'Commit messages, TODO comments, and docstrings you write become searchable for the next developer.' },
]

export default function Consent() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [toggles, setToggles] = useState({
    consent_audio: user?.consent_audio || false,
    consent_file: user?.consent_file || false,
    consent_transcript: user?.consent_transcript || false,
    consent_code: user?.consent_code || false,
  })
  const [saving, setSaving] = useState(false)

  const anyOn = Object.values(toggles).some(Boolean)

  const handleContinue = async () => {
    setSaving(true)
    try {
      await api.updateConsentApi(user.id, toggles)
      dispatch(updateConsent(toggles))
      navigate('/capture')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="consent-page">
      <div className="consent-wrap fade-in-up">
        <div className="consent-header">
          <div className="consent-header-icon"><i className="ti ti-shield-check" aria-hidden="true" /></div>
          <h1>You're in control of what gets captured</h1>
          <p>
            Pick which capture methods you're comfortable with. Everything runs on this machine —
            nothing ever leaves the building. You can change these anytime.
          </p>
        </div>

        <div className="consent-list">
          {METHODS.map((m) => (
            <ConsentToggleCard
              key={m.key}
              icon={m.icon}
              title={m.title}
              text={m.text}
              value={toggles[m.key]}
              onToggle={() => setToggles((t) => ({ ...t, [m.key]: !t[m.key] }))}
            />
          ))}
        </div>

        <div className="consent-footer">
          <button className="btn btn-primary" onClick={handleContinue} disabled={saving}>
            {saving
              ? <><span className="spinner" /> Saving…</>
              : anyOn
                ? <><i className="ti ti-check" aria-hidden="true" /> Save and continue</>
                : <>Continue without capture for now</>}
          </button>
          <p className="consent-note">
            Not switching anything on? That's fine — you can still ask the assistant questions.
            Capture just stays off until you say so.
          </p>
        </div>
      </div>
    </div>
  )
}
