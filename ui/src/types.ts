// バックエンドの JSON レスポンスの型（DESIGN-ui §3/§4）。
export interface Project {
  path: string
  name: string
  hasTakt: boolean
  missing?: boolean
}

export interface ProjectsResult {
  projects: Project[]
}

export interface GoalSummary {
  id: string
  objective: string
  status: string
  branch: string | null
  taskCount: number
  pendingQuestions: number
  updatedAt: string | null
}

export interface GoalTask {
  taskName: string
  workflow?: string | null
  enqueuedAt?: string | null
  state: string
  branch: string | null
  integratedSha: string | null
  note?: string | null
}

export interface GoalQuestion {
  id: string
  at: string
  body: string
  options: string[]
  status: string
  answer: string | null
  answeredAt: string | null
}

export interface WorkLogEntry {
  id: string
  at: string
  kind: string
  summary: string
}

export interface Goal extends GoalSummary {
  revision: number
  project: string
  createdAt: string
  outOfScope: string[]
  acceptanceCriteria: string[]
  constraints: string[]
  startBranch: string
  targetBranch: string
  tasks: GoalTask[]
  workLog: WorkLogEntry[]
  questions: GoalQuestion[]
  completion: unknown
}

export interface TaktTaskSummary {
  name: string | null
  status: string | null
  workflow: string | null
  branch: string | null
  baseBranch: string | null
  worktree: boolean | null
  worktreePath: string | null
  runSlug: string | null
  createdAt: string | null
  startedAt: string | null
  completedAt: string | null
  failure: { step: string | null; error: string | null } | null
  goalIds: string[]
}

export interface TaktTasksResult {
  tasks: TaktTaskSummary[]
  counts: Record<string, number>
  hasTakt?: boolean
  error?: string
  retryable?: boolean
}

export interface RunMeta {
  task?: string | null
  workflow?: string | null
  status?: string | null
  startTime?: string | null
  endTime?: string | null
  updatedAt?: string | null
  currentStep?: string | null
  currentIteration?: number | null
  phase?: string | null
}

export interface StepEvent {
  type: string
  step: string | null
  status: string | null
  at: string | null
  iteration?: number
  matchedRule?: unknown
  reason?: string
}

export interface RunDetail {
  slug?: string
  meta: RunMeta | null
  steps: StepEvent[]
  logFiles: { name: string; size: number }[]
  reports: { name: string; size: number }[]
  error?: string
  retryable?: boolean
}

export interface RunLogRecord {
  [key: string]: unknown
}

export interface RunLogResult {
  file: string
  offset: number
  nextOffset: number
  size: number
  records: RunLogRecord[]
  eof: boolean
  reset?: boolean
}

export interface ReportResult {
  name: string
  text: string
  truncated: boolean
}

export interface TaktGoalFile {
  path: string
  id?: string | null
  objective?: string | null
  status?: string | null
  executionStatus?: string | null
  branch?: string | null
  error?: string
}

export interface TaktGoalFilesResult {
  goals: TaktGoalFile[]
}

export interface ApiErrorBody {
  error?: string
  code?: string
}
