import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/slices/authSlice";
import api from "../api";
import "../styles/Auth.css";
import KTHubLogo from "../components/KTHubLogo";

const DEMO = [
  ["rohan.verma@mjunction.in", "Developer", "periwinkle"],
  ["sneha.iyer@mjunction.in", "Developer", "periwinkle"],
  ["neha.kulkarni@mjunction.in", "Tech lead", "teal"],
  ["akriti.jha@mjunction.in", "Admin", "coral"],
];

const needsConsent = (u) =>
  !u.consent_audio &&
  !u.consent_file &&
  !u.consent_transcript &&
  !u.consent_code;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Looks like something's missing");
      triggerShake();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await api.loginUser(email, password);
      dispatch(login(user));
      navigate(needsConsent(user) ? "/consent" : "/capture");
    } catch {
      setError("That email or password doesn't look right");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-illustration">
        <div className="auth-brand-logo">
          <KTHubLogo size={96} transparent />
        </div>
        <h1 className="auth-illustration-title">
          Knowledge Transfer, always on.{" "}
          <span className="auth-highlight">
            The colleague who never leaves.
          </span>
        </h1>
        <p className="auth-illustration-sub">
          A fully on-premise AI that captures institutional knowledge from daily
          work — voice, files, meetings and code — and hands it to the next
          person who needs it.
        </p>
        <div className="auth-stat-row">
          {[
            ["70%", "knowledge kept"],
            ["Day 1", "access for new devs"],
            ["0", "data leaves the building"],
          ].map(([v, l]) => (
            <div key={l} className="auth-stat">
              <span className="auth-stat-value">{v}</span>
              <span className="auth-stat-label">{l}</span>
            </div>
          ))}
        </div>
        <div
          className="auth-floating-card fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span
              className="pill source-badge source-periwinkle"
              style={{ fontSize: 10 }}
            >
              bug
            </span>
            <span
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                marginLeft: "auto",
              }}
            >
              Voice · Arjun
            </span>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              margin: "0 0 8px",
              lineHeight: 1.5,
            }}
          >
            ERP row limit causes blank CSV export at month end
          </p>
          <div className="confidence-bar-track" style={{ height: 5 }}>
            <div
              className="confidence-bar-fill"
              style={{ width: "91%", background: "var(--success)" }}
            />
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className={`auth-form-card card ${shake ? "shake" : ""}`}>
          <div className="auth-logo-mobile">
            <KTHubLogo size={34} transparent />
            <span>KTHub</span>
          </div>

          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Good to see you again</p>

          {error && (
            <div className="auth-error fade-in-up">
              <i className="ti ti-mood-sad" aria-hidden="true" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@mjunction.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="auth-label">Password</label>
            <div className="auth-password-wrap">
              <input
                type={showPw ? "text" : "password"}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                <i
                  className={`ti ${showPw ? "ti-eye-off" : "ti-eye"}`}
                  aria-hidden="true"
                />
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Signing you in…
                </>
              ) : (
                <>
                  <i className="ti ti-login-2" aria-hidden="true" /> Sign in
                </>
              )}
            </button>

            <p className="auth-switch">
              New here? <Link to="/signup">Create an account</Link>
            </p>
          </form>

          <div className="auth-demo-box">
            <span className="auth-demo-label">
              Try a demo account · password: Memory@123
            </span>
            {DEMO.map(([em, role, color]) => (
              <button
                key={em}
                type="button"
                className="auth-demo-row"
                onClick={() => {
                  setEmail(em);
                  setPassword("Memory@123");
                }}
              >
                <span className="mono">{em}</span>
                <span
                  className="auth-demo-role"
                  style={{ color: `var(--${color}-dark)` }}
                >
                  {role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
