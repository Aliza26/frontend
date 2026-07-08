import client from './client'

// Real backend has no login endpoint — auth stays frontend-side even in UAT.
// Everything below maps 1:1 to the documented API.

export { loginUser, signupUser } from './mockApi'

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

export const getEntries = async (filters) => {
  const { data } = await client.get('/knowledge/', { params: filters })
  return data
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
