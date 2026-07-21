import client from './client'

// Everything below maps 1:1 to the documented API.

const initials = (name) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

export const loginUser = async (email, password) => {
  try {
    const { data } = await client.post('/employees/login', { email, password })
    return { ...data, avatar: initials(data.name) }
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Invalid credentials')
  }
}

export const signupUser = async (form) => {
  const { data } = await client.post('/employees/signup', {
    name: form.name,
    email: form.email,
    password: form.password,
    role_type: form.role_type,
    team: form.team,
    project_id: form.project,
  })
  return { ...data, avatar: initials(data.name) }
}

export const getPublicProjects = async () => {
  const { data } = await client.get('/projects/public')
  return data
}

export const updateConsentApi = async (employeeId, consent) => {
  const { data } = await client.put(`/employees/${employeeId}/consent`, consent)
  return data
}

export const getMyProjects = async (user) => {
  const { data } = await client.get('/projects/', { params: { requester_id: user.id } })
  return data
}

export const createProject = async (payload, createdBy) => {
  const { data } = await client.post('/projects/', payload, { params: { created_by: createdBy } })
  return data
}

export const getProjectMembers = async (projectId, requesterId) => {
  const { data } = await client.get(`/projects/${projectId}/members`, { params: { requester_id: requesterId } })
  return data
}

export { getTags, getWatcherStatus } from './mockApi'

export const captureText = async (payload) => {
  const { data } = await client.post('/capture/text', {
    project_id: payload.project_id,
    employee_id: payload.employee_id,
    text: payload.text,
  })
  return data
}

export const captureAudio = async (payload) => {
  const form = new FormData()
  form.append('project_id', payload.project_id)
  form.append('employee_id', payload.employee_id)
  form.append('audio_file', payload.audio_file)
  const { data } = await client.post('/capture/audio', form)
  return data
}

export const captureFile = async (payload) => {
  const form = new FormData()
  form.append('project_id', payload.project_id)
  form.append('employee_id', payload.employee_id)
  form.append('document', payload.document)
  const { data } = await client.post('/capture/file', form)
  return data
}

export const captureVtt = async (payload) => {
  const form = new FormData()
  form.append('project_id', payload.project_id)
  form.append('employee_id', payload.employee_id)
  form.append('vtt_file', payload.vtt_file)
  const { data } = await client.post('/capture/vtt', form)
  return data
}

export const captureCode = async (payload) => {
  const { data } = await client.post('/capture/code', payload)
  return data
}

// Backend only returns { total, entries, offset, limit } and `total` reflects
// whatever status/source filters are passed — it doesn't give a stable
// verified/pending/this_week breakdown. Fetch the scope (project/team) once
// without status/source filters to derive those, separately from the
// filtered page actually shown in the grid.
export const getEntries = async (filters) => {
  const { status, source_type, min_confidence, ...scope } = filters
  const [{ data: all }, { data: filtered }] = await Promise.all([
    client.get('/knowledge/', { params: { ...scope, limit: 200 } }),
    client.get('/knowledge/', { params: filters }),
  ])

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const allEntries = all.entries || []

  return {
    total: all.total,
    verified: allEntries.filter((e) => e.verification_status === 'verified').length,
    pending: allEntries.filter((e) => e.verification_status === 'pending').length,
    this_week: allEntries.filter((e) => new Date(e.capture_date).getTime() >= weekAgo).length,
    entries: filtered.entries,
  }
}

export const verifyEntry = async (id, status, verifiedBy) => {
  const { data } = await client.put(`/knowledge/${id}/verify`, { verified_by: verifiedBy, status })
  return data
}

export const rateEntry = async (id, rating, employeeId) => {
  const { data } = await client.post(`/knowledge/${id}/rate`, { employee_id: employeeId, rating })
  return data
}

export const askAssistant = async (payload) => {
  const { data } = await client.post('/assistant/query', payload)
  return data
}

export { getSuggestedQuestions } from './mockApi'

export const getDashboardStats = async (requesterId, projectId) => {
  const { data } = await client.get('/dashboard/stats', { params: { requester_id: requesterId, project_id: projectId } })
  return data
}

export const getTeamCoverage = async (requesterId, projectId) => {
  const { data } = await client.get('/dashboard/coverage', { params: { requester_id: requesterId, project_id: projectId } })
  return data
}

export const getRecurringProblems = async (requesterId, projectId) => {
  const { data } = await client.get('/dashboard/recurring', { params: { requester_id: requesterId, project_id: projectId } })
  return data
}

export const getPendingQueue = async (requesterId, projectId) => {
  const { data } = await client.get('/dashboard/pending', { params: { requester_id: requesterId, project_id: projectId } })
  return data
}

export { getAllEmployees } from './mockApi'

export const getSystemHealth = async () => {
  const { data } = await client.get('/health', { baseURL: (import.meta.env.VITE_API_BASE_URL || '').replace('/api/v1', '') })
  return data
}

// ── Tickets ("Solve with KTHub") ──────────────────────────────
// Mounted at /api/tickets on the backend (not /api/v1) — new namespace.
const TICKETS_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '/api')

export const getTickets = async () => {
  const { data } = await client.get('/tickets', { baseURL: TICKETS_BASE_URL })
  return data
}

export const getTicket = async (ticketId) => {
  const { data } = await client.get(`/tickets/${ticketId}`, { baseURL: TICKETS_BASE_URL })
  return data
}

export const ticketChat = async (ticketId, { message, phase, history }) => {
  const { data } = await client.post(`/tickets/${ticketId}/chat`, { message, phase, history }, { baseURL: TICKETS_BASE_URL })
  return data
}

export const ticketCapture = async (ticketId, { employee_id, project_id, transcript }) => {
  const { data } = await client.post(`/tickets/${ticketId}/capture`, { employee_id, project_id, transcript }, { baseURL: TICKETS_BASE_URL })
  return data
}
