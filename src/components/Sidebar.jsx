import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { clearProjects } from '../store/slices/projectSlice'
import { toggleTheme } from '../store/slices/themeSlice'
import ProjectSwitcher from './ProjectSwitcher'

const navItems = [
  { path: '/capture',   label: 'Capture',    icon: 'ti-feather',      minRole: 'developer' },
  { path: '/assistant', label: 'Assistant',  icon: 'ti-message-dots', minRole: 'developer' },
  { path: '/knowledge', label: 'Knowledge',  icon: 'ti-bulb',         minRole: 'developer' },
  { path: '/dashboard', label: 'Dashboard',  icon: 'ti-chart-bar',    minRole: 'tech_lead' },
  { path: '/admin',     label: 'Admin',      icon: 'ti-settings',     minRole: 'admin' },
]

const hierarchy = { developer: 1, tech_lead: 2, admin: 3 }
const roleLabel = { developer: 'Developer', tech_lead: 'Tech lead', admin: 'Admin' }
const roleColor = { developer: 'periwinkle', tech_lead: 'teal', admin: 'coral' }

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth)
  const { mode } = useSelector((state) => state.theme)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  if (!user) return null

  const visible = navItems.filter((i) => hierarchy[user.role_type] >= hierarchy[i.minRole])
  const firstName = user.name.split(' ')[0]
  const env = import.meta.env.VITE_ENV || 'local'
  const isMock = import.meta.env.VITE_USE_MOCK === 'true'

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearProjects())
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark"><i className="ti ti-bulb" aria-hidden="true" /></div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">MemoryOS</span>
          <span className="sidebar-logo-sub">Tata Group · POC</span>
        </div>
      </div>

      <div className="sidebar-greeting">Hey, {firstName} <span className="sidebar-wave">👋</span></div>

      <div className="sidebar-project"><ProjectSwitcher /></div>

      <nav className="sidebar-nav">
        {visible.map((item) => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink to="/consent" className="sidebar-consent-link">
        <i className="ti ti-toggle-right" aria-hidden="true" />
        <span className="sidebar-link-label">Capture consent</span>
      </NavLink>

      <button className="sidebar-theme-toggle" onClick={() => dispatch(toggleTheme())}>
        <i className={`ti ${mode === 'light' ? 'ti-moon' : 'ti-sun'}`} aria-hidden="true" />
        <span className="sidebar-link-label">{mode === 'light' ? 'Dark mode' : 'Light mode'}</span>
      </button>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.avatar}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className={`pill role-pill role-${roleColor[user.role_type]}`}>{roleLabel[user.role_type]}</span>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} aria-label="Log out">
            <i className="ti ti-logout" aria-hidden="true" />
          </button>
        </div>
        <div className="sidebar-env">{env} · {isMock ? 'mock data' : 'live API'}</div>
      </div>
    </aside>
  )
}
