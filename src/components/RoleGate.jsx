import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const hierarchy = { developer: 1, tech_lead: 2, admin: 3 }

export default function RoleGate({ children, minRole = 'developer' }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (hierarchy[user.role_type] < hierarchy[minRole]) return <Navigate to="/capture" replace />

  return children
}
