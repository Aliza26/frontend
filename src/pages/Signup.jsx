import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/slices/authSlice";
import api from "../api";
import "../styles/Auth.css";
import KTHubLogo from "../components/KTHubLogo";

const TEAMS = ["Backend", "Frontend", "DevOps", "Platform", "QA", "Mobile"];
const ROLES = [
  { value: "developer", label: "Developer" },
  { value: "tech_lead", label: "Tech lead" },
  { value: "admin", label: "Admin" },
];
const PROJECTS = [{ id: "proj_mjc", name: "mj-care" }];
export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    team: "",
    role_type: "",
    project: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "We'll need a name to greet you by";
    if (!form.email.includes("@")) e.email = "That doesn't look like an email";
    if (form.password.length < 6) e.password = "At least 6 characters please";
    if (!form.team) e.team = "Pick a team";
    if (!form.role_type) e.role_type = "Pick a role";
    if (!form.project) e.project = "Pick a project";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    try {
      const user = await api.signupUser(form);
      dispatch(login(user));
      navigate("/consent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-illustration">
        <div className="auth-illustration-card pop-in">
          <i className="ti ti-users-group" aria-hidden="true" />
        </div>
        <h1 className="auth-illustration-title">
          Join the team —{" "}
          <span className="auth-highlight">
            start day one with everything they knew
          </span>
        </h1>
        <div className="auth-feature-list">
          {[
            ["ti-microphone", "Speak a fix, it gets captured in seconds"],
            [
              "ti-message-dots",
              "Ask anything, get cited answers from real teammates",
            ],
            ["ti-lock", "Everything stays on this machine. Nothing leaves."],
          ].map(([icon, text]) => (
            <div key={text} className="auth-feature-row">
              <div className="auth-feature-icon">
                <i className={`ti ${icon}`} aria-hidden="true" />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-form-side">
        <div
          className={`auth-form-card auth-form-card-wide card ${shake ? "shake" : ""}`}
        >
          <div className="auth-logo-mobile">
            <div className="auth-logo-mark">
              <i className="ti ti-bulb" aria-hidden="true" />
            </div>
            <span>MemoryOS</span>
          </div>

          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Tell us a bit about you</p>

          <form onSubmit={handleSubmit}>
            <label className="auth-label">Full name</label>
            <input
              className={`input ${errors.name ? "auth-input-error" : ""}`}
              placeholder="Priya Patel"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && (
              <span className="auth-field-error">{errors.name}</span>
            )}

            <label className="auth-label">Email</label>
            <input
              className={`input ${errors.email ? "auth-input-error" : ""}`}
              placeholder="you@tata.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            {errors.email && (
              <span className="auth-field-error">{errors.email}</span>
            )}

            <label className="auth-label">Password</label>
            <div className="auth-password-wrap">
              <input
                type={showPw ? "text" : "password"}
                className={`input ${errors.password ? "auth-input-error" : ""}`}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
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
            {errors.password && (
              <span className="auth-field-error">{errors.password}</span>
            )}

            <div className="auth-row-3">
              <div>
                <label className="auth-label">Team</label>
                <select
                  className={`input ${errors.team ? "auth-input-error" : ""}`}
                  value={form.team}
                  onChange={(e) => set("team", e.target.value)}
                >
                  <option value="">Select</option>
                  {TEAMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="auth-label">Role</label>
                <select
                  className={`input ${errors.role_type ? "auth-input-error" : ""}`}
                  value={form.role_type}
                  onChange={(e) => set("role_type", e.target.value)}
                >
                  <option value="">Select</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="auth-label">Project</label>
                <select
                  className={`input ${errors.project ? "auth-input-error" : ""}`}
                  value={form.project}
                  onChange={(e) => set("project", e.target.value)}
                >
                  <option value="">Select</option>
                  {PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Setting things up…
                </>
              ) : (
                <>
                  <i className="ti ti-user-plus" aria-hidden="true" /> Create
                  account
                </>
              )}
            </button>

            <p className="auth-switch">
              Already on MemoryOS? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
