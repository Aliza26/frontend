const delay = (ms) => new Promise((res) => setTimeout(res, ms))

// ── Mock users (password for all: Memory@123) ────────────────────
const USERS = {
  'priya.new@tata.com': {
    id: 'emp_priya', name: 'Priya Patel', email: 'priya.new@tata.com',
    role_type: 'developer', title: 'Junior Backend Developer', team: 'Backend',
    consent_audio: false, consent_file: false, consent_transcript: false, consent_code: false,
    project_ids: ['proj_mjc'], avatar: 'PP',
  },
  'arjun.old@tata.com': {
    id: 'emp_arjun', name: 'Arjun Sharma', email: 'arjun.old@tata.com',
    role_type: 'developer', title: 'Senior Backend Developer', team: 'Backend',
    consent_audio: true, consent_file: true, consent_transcript: true, consent_code: true,
    project_ids: ['proj_mjc'], avatar: 'AS',
  },
  'rahul.lead@tata.com': {
    id: 'emp_rahul', name: 'Rahul Mehta', email: 'rahul.lead@tata.com',
    role_type: 'tech_lead', title: 'Engineering Tech Lead', team: 'Backend',
    consent_audio: true, consent_file: true, consent_transcript: true, consent_code: true,
    project_ids: ['proj_mjc'], avatar: 'RM',
  },
  'admin@tata.com': {
    id: 'emp_admin', name: 'Anita Rao', email: 'admin@tata.com',
    role_type: 'admin', title: 'Platform Admin', team: 'Platform',
    consent_audio: true, consent_file: true, consent_transcript: true, consent_code: true,
    project_ids: ['proj_mjc'], avatar: 'AR',
  },
}

const PASSWORD = 'Memory@123'

const PROJECTS = [
  { id: 'proj_mjc', name: 'mj-care', code: 'MJC', status: 'active', description: 'mjunction mj-care platform', repo_url: 'github.com/mjunction/mj-care' },
]

// ── Auth ─────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  await delay(900)
  const user = USERS[email.toLowerCase()]
  if (!user || password !== PASSWORD) throw new Error('Invalid credentials')
  return { ...user }
}

export const signupUser = async (data) => {
  await delay(1100)
  const user = {
    id: 'emp_' + Date.now(),
    name: data.name,
    email: data.email,
    role_type: data.role_type || 'developer',
    title: data.title || '',
    team: data.team,
    consent_audio: false, consent_file: false, consent_transcript: false, consent_code: false,
    project_ids: [data.project],
    avatar: data.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
  }
  USERS[data.email.toLowerCase()] = user
  return { ...user }
}

export const updateConsentApi = async (employeeId, consent) => {
  await delay(500)
  const user = Object.values(USERS).find((u) => u.id === employeeId)
  if (user) Object.assign(user, consent)
  return { employee_id: employeeId, ...consent }
}

// ── Projects ─────────────────────────────────────────────────────
export const getMyProjects = async (user) => {
  await delay(400)
  if (user.role_type === 'admin') return [...PROJECTS]
  return PROJECTS.filter((p) => user.project_ids.includes(p.id))
}

export const createProject = async (data) => {
  await delay(700)
  const proj = {
    id: 'proj_' + Date.now(), name: data.name,
    code: data.code.toUpperCase(), status: 'active',
    description: data.description || '', repo_url: data.repo_url || '',
  }
  PROJECTS.push(proj)
  return proj
}

export const getProjectMembers = async (projectId) => {
  await delay(400)
  return Object.values(USERS)
    .filter((u) => u.project_ids.includes(projectId))
    .map((u) => ({ employee_id: u.id, name: u.name, role_type: u.role_type, title: u.title, is_active: true }))
}

// ── Tags ─────────────────────────────────────────────────────────
export const getTags = async () => {
  await delay(500)
  return [
    { id: 'bug',            label: 'Bug',              icon: 'ti-bug',              color: 'coral' },
    { id: 'task',           label: 'Task',             icon: 'ti-clipboard-list',   color: 'periwinkle' },
    { id: 'problem',        label: 'Problem',          icon: 'ti-alert-triangle',   color: 'amber' },
    { id: 'business-logic', label: 'Business Logic',   icon: 'ti-code',             color: 'teal' },
    { id: 'config',         label: 'Configuration',    icon: 'ti-settings',         color: 'pink' },
    { id: 'deployment',     label: 'Deployment',       icon: 'ti-rocket',           color: 'coral' },
    { id: 'security',       label: 'Security',         icon: 'ti-shield',           color: 'coral' },
    { id: 'architecture',   label: 'Architecture',     icon: 'ti-building-arch',    color: 'periwinkle' },
    { id: 'database',       label: 'Database',         icon: 'ti-database',         color: 'teal' },
    { id: 'api',            label: 'API / Integration', icon: 'ti-api',             color: 'periwinkle' },
    { id: 'performance',    label: 'Performance',      icon: 'ti-bolt',             color: 'amber' },
    { id: 'documentation',  label: 'Documentation',    icon: 'ti-file-description', color: 'pink' },
    { id: 'other',          label: 'Other',            icon: 'ti-pencil-plus',      color: 'amber' },
  ]
}

// ── File watcher ─────────────────────────────────────────────────
export const getWatcherStatus = async () => {
  await delay(350)
  return {
    active: true,
    path: '/inbox/',
    todayCount: 3,
    pendingCount: 0,
    recentFiles: [
      { name: 'deployment-sop.pdf', type: 'pdf', time: '2 min ago' },
      { name: 'auth-bypass-notes.docx', type: 'docx', time: '1 hr ago' },
      { name: 'api-rate-limits.txt', type: 'txt', time: '3 hrs ago' },
    ],
  }
}

// ── Capture ──────────────────────────────────────────────────────
const CONSENT_KEY = { audio: 'consent_audio', text: 'consent_audio', file: 'consent_file', vtt: 'consent_transcript', code: 'consent_code' }

const EXTRACTIONS = [
  {
    problem_summary: 'Monthly mj-care order export produces a blank CSV file with no error message',
    root_cause: 'The reporting service has a hard row limit of 500 on any export. Exceeding this causes a silent failure — the file comes out empty.',
    solution_steps: [
      'Open the reporting export panel and set the date range as usual.',
      'Set the row limit to 400 instead of the default 1000.',
      'Run the first export, then a second with offset 401.',
      'Merge both CSV files by copying rows from file 2 below the header of file 1.',
    ],
    tags: ['reporting', 'mj-care', 'export'],
  },
  {
    problem_summary: 'Race condition in the mj-care payment flow causes duplicate charges',
    root_cause: 'Two concurrent gateway callbacks trigger the same payment handler without a mutex lock.',
    solution_steps: [
      'Add a Redis distributed lock keyed on payment_id.',
      'Set the lock TTL to 30 seconds.',
      'Check the lock before processing each callback.',
    ],
    tags: ['payments', 'mj-care', 'race-condition'],
  },
  {
    problem_summary: 'REDIS_URL missing from .env.example breaks new mj-care developer setup',
    root_cause: '.env.example was never updated when Redis was added to the stack six months ago.',
    solution_steps: [
      'Add REDIS_URL=redis://localhost:6379 to .env.example.',
      'Add REDIS_TTL=3600 as well.',
      'Update the README setup section to mention Redis.',
    ],
    tags: ['config', 'dev-setup', 'environment'],
  },
]

const doCapture = async (method, payload, ms) => {
  await delay(ms)
  const user = Object.values(USERS).find((u) => u.id === payload.employee_id)
  const consentField = CONSENT_KEY[method]
  if (user && !user[consentField]) {
    return {
      status: 'rejected',
      entry_id: null,
      message: `You haven't switched on ${consentField.replace('consent_', '')} capture yet — flip it on in your consent settings and try again.`,
    }
  }
  const isDuplicate = (payload.text || payload.commit_message || payload.file_content || '')
    .toLowerCase().includes('duplicate')
  if (isDuplicate) {
    return {
      status: 'duplicate',
      entry_id: 'ENT-0041',
      similarity: 0.91,
      existing_entry_id: 'ENT-0041',
      message: 'Similar entry already exists in this project (similarity 91%). Frequency count updated.',
    }
  }
  const extracted = EXTRACTIONS[Math.floor(Math.random() * EXTRACTIONS.length)]
  const confidence = 0.72 + Math.random() * 0.24
  return {
    status: 'created',
    entry_id: 'ENT-' + String(Math.floor(Math.random() * 9000) + 1000),
    transcription: method === 'audio' ? 'So I just fixed that export issue again. The monthly mj-care export was giving us a blank CSV…' : null,
    confidence_score: confidence,
    needs_review: confidence < 0.75,
    extracted: { ...extracted, tags: [payload.tag, ...extracted.tags] },
    message: 'Entry created',
  }
}

export const captureAudio = (payload) => doCapture('audio', payload, 3000)
export const captureText  = (payload) => doCapture('text', payload, 2600)
export const captureFile  = (payload) => doCapture('file', payload, 2400)
export const captureVtt   = (payload) => doCapture('vtt', payload, 2600)
export const captureCode  = (payload) => doCapture('code', payload, 2400)

// ── Knowledge entries ────────────────────────────────────────────
const ENTRIES = [
  {
    id: 'ENT-0041', project_id: 'proj_mjc', employee: 'Arjun Sharma', team: 'Backend',
    problem_summary: 'Monthly mj-care order export produces a blank CSV file',
    root_cause: 'Reporting service row limit of 500 causes a silent export failure — the file comes out empty.',
    solution_steps: ['Set the export row limit to 400', 'Run two batches with offset', 'Merge the CSV files'],
    tags: ['bug', 'reporting', 'export'], source_type: 'audio', code_capture_subtype: null,
    confidence_score: 0.91, frequency_seen: 11, verification_status: 'verified', capture_date: '2026-05-18',
  },
  {
    id: 'ENT-0039', project_id: 'proj_mjc', employee: 'Arjun Sharma', team: 'Backend',
    problem_summary: 'Race condition in mj-care payment flow causes duplicate charges',
    root_cause: 'Two concurrent gateway callbacks trigger the same payment handler without a mutex lock.',
    solution_steps: ['Add Redis distributed lock on payment_id', 'Set TTL to 30 seconds', 'Check lock before processing'],
    tags: ['bug', 'payments'], source_type: 'audio', code_capture_subtype: null,
    confidence_score: 0.94, frequency_seen: 4, verification_status: 'verified', capture_date: '2026-05-12',
  },
  {
    id: 'ENT-0037', project_id: 'proj_mjc', employee: 'Arjun Sharma', team: 'Backend',
    problem_summary: 'REDIS_URL missing from .env.example causes new dev setup failures',
    root_cause: '.env.example was not updated when Redis was added six months ago.',
    solution_steps: ['Add REDIS_URL to .env.example', 'Add REDIS_TTL too', 'Update the README setup section'],
    tags: ['config', 'dev-setup'], source_type: 'text', code_capture_subtype: null,
    confidence_score: 0.87, frequency_seen: 6, verification_status: 'verified', capture_date: '2026-05-08',
  },
  {
    id: 'ENT-0035', project_id: 'proj_mjc', employee: 'Sneha Gupta', team: 'Platform',
    problem_summary: 'Catalog search reindex must run before deploy or results go stale',
    root_cause: 'New listings reference index fields that do not exist until the reindex job runs.',
    solution_steps: ['Run the reindex job first', 'Wait for confirmation', 'Then deploy the new code', 'Rollback order is the reverse'],
    tags: ['deployment', 'search'], source_type: 'vtt', code_capture_subtype: null,
    confidence_score: 0.89, frequency_seen: 8, verification_status: 'verified', capture_date: '2026-05-01',
  },
  {
    id: 'ENT-0033', project_id: 'proj_mjc', employee: 'Sneha Gupta', team: 'Platform',
    problem_summary: 'Payment gateway token real expiry is 55 minutes, not 60 as documented',
    root_cause: 'The vendor silently reduced the TTL. Five minutes of clock skew causes failed captures.',
    solution_steps: ['Set the refresh threshold to 50 minutes', 'Add a 5 minute buffer in refresh logic', 'Update internal docs'],
    tags: ['api', 'auth'], source_type: 'text', code_capture_subtype: null,
    confidence_score: 0.82, frequency_seen: 3, verification_status: 'verified', capture_date: '2026-04-28',
  },
  {
    id: 'ENT-0031', project_id: 'proj_mjc', employee: 'Arjun Sharma', team: 'Backend',
    problem_summary: 'Do not touch the legacy mj-care order module — causes silent data corruption',
    root_cause: 'The legacy module has undocumented side effects on shared order state. A refactor was attempted and abandoned.',
    solution_steps: ['Never modify files under /src/legacy/orders/', 'Create a wrapper if new behaviour is needed', 'Talk to Arjun before any changes'],
    tags: ['architecture', 'tech-debt'], source_type: 'code', code_capture_subtype: 'code_comment',
    repo_name: 'mj-care', file_path: 'src/legacy/orders/core.py',
    confidence_score: 0.96, frequency_seen: 2, verification_status: 'verified', capture_date: '2026-04-20',
  },
  {
    id: 'ENT-0029', project_id: 'proj_mjc', employee: 'Sneha Gupta', team: 'Platform',
    problem_summary: 'Memory leak in the mj-care image upload handler crashes the server after ~200 uploads',
    root_cause: 'Temp files are not cleaned up after multipart uploads, so the OS runs out of file descriptors.',
    solution_steps: ['Call cleanup() in the finally block of the upload handler', 'Add an upload count metric'],
    tags: ['performance', 'memory'], source_type: 'text', code_capture_subtype: null,
    confidence_score: 0.71, frequency_seen: 5, verification_status: 'pending', capture_date: '2026-04-15',
  },
  {
    id: 'ENT-0027', project_id: 'proj_mjc', employee: 'Arjun Sharma', team: 'Backend',
    problem_summary: 'Intentional auth bypass on the mj-care internal health check route',
    root_cause: 'The health check endpoint skips token validation by design so monitoring tools can poll it without credentials.',
    solution_steps: ['Do not add auth middleware to /health', 'Create a separate route if a new monitoring tool needs one', 'Document any new bypass in the security register'],
    tags: ['security', 'auth'], source_type: 'code', code_capture_subtype: 'code_comment',
    repo_name: 'mj-care', file_path: 'src/api/health.py',
    confidence_score: 0.68, frequency_seen: 1, verification_status: 'pending', capture_date: '2026-04-10',
  },
]

export const getEntries = async (filters = {}) => {
  await delay(700)
  let list = [...ENTRIES]
  if (filters.project_id) list = list.filter((e) => e.project_id === filters.project_id)
  if (filters.team) list = list.filter((e) => e.team === filters.team)
  if (filters.status) list = list.filter((e) => e.verification_status === filters.status)
  if (filters.source_type) list = list.filter((e) => e.source_type === filters.source_type)
  if (filters.min_confidence) list = list.filter((e) => e.confidence_score >= filters.min_confidence)
  return {
    total: list.length,
    verified: list.filter((e) => e.verification_status === 'verified').length,
    pending: list.filter((e) => e.verification_status === 'pending').length,
    this_week: 4,
    entries: list,
  }
}

export const verifyEntry = async (id, status) => {
  await delay(500)
  const entry = ENTRIES.find((e) => e.id === id)
  if (entry) entry.verification_status = status
  return { entry_id: id, verification_status: status }
}

export const rateEntry = async (id, rating) => {
  await delay(350)
  return { entry_id: id, usefulness_score: rating, rating_count: 1 }
}

// ── Assistant ────────────────────────────────────────────────────
const ANSWERS = [
  {
    answer: 'This has happened before — the blank CSV comes from the reporting service\u2019s hard row limit of 500. When mj-care order volume crosses that at month end, the export silently fails. The fix: split the export into two batches of 400 rows each, then merge them. This issue has come up 11 times.',
    match: ['csv', 'export', 'blank', 'order', 'empty', 'invoice', 'download', 'report'],
    sources: [
      { entry_id: 'ENT-0041', project_id: 'proj_mjc', problem_summary: 'Monthly mj-care order export produces a blank CSV file', source_type: 'audio', team: 'Backend', confidence_score: 0.91, frequency_seen: 11, verification_status: 'verified', similarity: 0.89, capture_date: '2026-05-18', employee: 'Arjun Sharma' },
    ],
  },
  {
    answer: 'The catalog search reindex must always run before the code deploy. New listings reference index fields that don\u2019t exist until the reindex runs — deploy code first and search results go stale. Rollback order is the reverse.',
    match: ['reindex', 'deploy', 'deployment', 'search', 'catalog', 'stale'],
    sources: [
      { entry_id: 'ENT-0035', project_id: 'proj_mjc', problem_summary: 'Catalog search reindex must run before deploy', source_type: 'vtt', team: 'Platform', confidence_score: 0.89, frequency_seen: 8, verification_status: 'verified', similarity: 0.85, capture_date: '2026-05-01', employee: 'Sneha Gupta' },
    ],
  },
  {
    answer: 'Stay away from /src/legacy/orders/ in mj-care — it has undocumented side effects on shared order state and a refactor was already attempted and abandoned. If you need new order behaviour, wrap around it instead, and talk to Arjun before touching anything there.',
    match: ['touch', 'legacy', 'avoid', 'fragile', 'codebase', 'orders', 'never'],
    sources: [
      { entry_id: 'ENT-0031', project_id: 'proj_mjc', problem_summary: 'Do not touch the legacy mj-care order module', source_type: 'code', team: 'Backend', confidence_score: 0.96, frequency_seen: 2, verification_status: 'verified', similarity: 0.87, capture_date: '2026-04-20', employee: 'Arjun Sharma' },
    ],
  },
  {
    answer: 'There\u2019s a known race condition in the mj-care payment flow: two concurrent gateway callbacks can trigger the same payment handler and double-charge. The fix in place is a Redis distributed lock keyed on payment_id with a 30 second TTL — check the lock before processing.',
    match: ['race', 'payment', 'duplicate charge', 'callback', 'charge'],
    sources: [
      { entry_id: 'ENT-0039', project_id: 'proj_mjc', problem_summary: 'Race condition in mj-care payment flow', source_type: 'audio', team: 'Backend', confidence_score: 0.94, frequency_seen: 4, verification_status: 'verified', similarity: 0.9, capture_date: '2026-05-12', employee: 'Arjun Sharma' },
    ],
  },
]

export const askAssistant = async ({ question }) => {
  await delay(2800)
  const q = question.toLowerCase()
  const hit = ANSWERS.find((a) => a.match.some((m) => q.includes(m)))
  if (hit) return { answer: hit.answer, query: question, sources: hit.sources }
  const fallback = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
  return { answer: fallback.answer, query: question, sources: fallback.sources }
}

export const getSuggestedQuestions = async () => {
  await delay(300)
  return [
    'Why does the mj-care order export return an empty CSV?',
    'What is the deploy order for the catalog search reindex?',
    'Which parts of the codebase should I never touch?',
    'What are the known race conditions in the payment flow?',
  ]
}

// ── Dashboard ────────────────────────────────────────────────────
export const getDashboardStats = async (projectId) => {
  await delay(600)
  return {
    project_id: projectId || null,
    total_entries: 47, verified: 31, pending_review: 16,
    low_confidence_flagged: 5, verification_rate_pct: 66,
    verified_this_week: 8, weekly_queries: 91, avg_confidence: 0.86,
    by_source: { audio: 18, text: 12, code: 9, vtt: 5, file: 3 },
  }
}

export const getTeamCoverage = async () => {
  await delay(500)
  return [
    { team: 'Backend', total_entries: 37, verified_entries: 29, coverage_pct: 78 },
    { team: 'DevOps', total_entries: 26, verified_entries: 14, coverage_pct: 55 },
    { team: 'Platform', total_entries: 15, verified_entries: 5, coverage_pct: 31 },
    { team: 'QA', total_entries: 11, verified_entries: 2, coverage_pct: 22 },
  ]
}

export const getRecurringProblems = async () => {
  await delay(500)
  return [
    { entry_id: 'ENT-0041', problem_summary: 'Blank CSV on mj-care order export', frequency_seen: 11, team: 'Backend', verification_status: 'verified', confidence_score: 0.91 },
    { entry_id: 'ENT-0035', problem_summary: 'Catalog reindex order on deploy', frequency_seen: 8, team: 'Platform', verification_status: 'verified', confidence_score: 0.89 },
    { entry_id: 'ENT-0029', problem_summary: 'Memory leak in the upload handler', frequency_seen: 5, team: 'Platform', verification_status: 'pending', confidence_score: 0.71 },
    { entry_id: 'ENT-0039', problem_summary: 'Race condition in payments', frequency_seen: 4, team: 'Backend', verification_status: 'verified', confidence_score: 0.94 },
  ]
}

export const getPendingQueue = async () => {
  await delay(500)
  return ENTRIES
    .filter((e) => e.verification_status === 'pending')
    .sort((a, b) => a.confidence_score - b.confidence_score)
    .map((e) => ({
      entry_id: e.id, project_id: e.project_id, problem_summary: e.problem_summary,
      confidence_score: e.confidence_score, source_type: e.source_type,
      team: e.team, capture_date: e.capture_date, employee: e.employee,
    }))
}

// ── Admin ────────────────────────────────────────────────────────
export const getAllEmployees = async () => {
  await delay(500)
  return Object.values(USERS).map((u) => ({
    id: u.id, name: u.name, email: u.email, role_type: u.role_type,
    team: u.team, title: u.title,
    projects: PROJECTS.filter((p) => u.project_ids.includes(p.id)).map((p) => p.name),
  }))
}

export const getSystemHealth = async () => {
  await delay(400)
  return {
    status: 'healthy', llm: 'kthub-llm', ollama: 'http://localhost:11434',
    total_entries: 47, storage_used_mb: 128, storage_total_mb: 512,
    entries_by_project: [
      { project: 'mj-care', count: 47 },
    ],
    audit_log: [
      { id: 'AUD-001', action: 'entry.verified', entity: 'ENT-0041', user: 'Rahul Mehta', time: '2 min ago' },
      { id: 'AUD-002', action: 'entry.created', entity: 'ENT-0042', user: 'Arjun Sharma', time: '15 min ago' },
      { id: 'AUD-003', action: 'consent.updated', entity: 'emp_priya', user: 'Priya Patel', time: '1 hr ago' },
      { id: 'AUD-004', action: 'user.login', entity: 'emp_priya', user: 'Priya Patel', time: '1 hr ago' },
      { id: 'AUD-005', action: 'entry.rated', entity: 'ENT-0039', user: 'Priya Patel', time: '3 hrs ago' },
    ],
  }
}