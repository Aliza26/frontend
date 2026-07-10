import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'

const navItems = [
  { path: '/capture',   label: 'KTCap',   icon: 'ti-feather',      minRole: 'developer' },
  { path: '/assistant', label: 'KTChat',  icon: 'ti-message-dots', minRole: 'developer' },
  { path: '/knowledge', label: 'Knowledge', icon: 'ti-bulb',       minRole: 'developer' },
  { path: '/dashboard', label: 'KTDash',  icon: 'ti-chart-bar',    minRole: 'tech_lead' },
  { path: '/admin',     label: 'Admin',   icon: 'ti-settings',     minRole: 'admin' },
]
const hierarchy = { developer: 1, tech_lead: 2, admin: 3 }

export default function BottomNav() {
  const { user } = useSelector((state) => state.auth)
  if (!user) return null

  const visible = navItems.filter((i) => hierarchy[user.role_type] >= hierarchy[i.minRole]).slice(0, 5)

  return (
    <nav className="bottom-nav">
      {visible.map((item) => (
        <NavLink key={item.path} to={item.path}
          className={({ isActive }) => `bottom-nav-link ${isActive ? 'bottom-nav-link-active' : ''}`}>
          <i className={`ti ${item.icon}`} aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
