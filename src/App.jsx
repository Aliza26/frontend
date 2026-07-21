import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { setProjects } from './store/slices/projectSlice'
import RoleGate from './components/RoleGate'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import { ToastProvider } from './components/Toast'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Consent from './pages/Consent'
import Capture from './pages/Capture'
import KnowledgeBase from './pages/KnowledgeBase'
import Assistant from './pages/Assistant'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import MyTickets from './pages/MyTickets'
import SolveTicket from './pages/SolveTicket'
import api from './api'
import './styles/global.css'
import './styles/Shell.css'

function AppLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { projects } = useSelector((state) => state.project)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isAuthenticated && user && projects.length === 0) {
      api.getMyProjects(user).then((p) => dispatch(setProjects(p)))
    }
  }, [isAuthenticated, user, projects.length, dispatch])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/capture" replace />} />
            <Route path="/capture" element={<RoleGate><Capture /></RoleGate>} />
            <Route path="/tickets" element={<RoleGate><MyTickets /></RoleGate>} />
            <Route path="/tickets/:ticketId/solve" element={<RoleGate><SolveTicket /></RoleGate>} />
            <Route path="/knowledge" element={<RoleGate><KnowledgeBase /></RoleGate>} />
            <Route path="/assistant" element={<RoleGate><Assistant /></RoleGate>} />
            <Route path="/dashboard" element={<RoleGate minRole="tech_lead"><Dashboard /></RoleGate>} />
            <Route path="/admin" element={<RoleGate minRole="admin"><Admin /></RoleGate>} />
            <Route path="*" element={<Navigate to="/capture" replace />} />
          </Routes>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const { mode } = useSelector((state) => state.theme)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(mode)
  }, [mode])

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/consent" element={isAuthenticated ? <Consent /> : <Navigate to="/login" replace />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
