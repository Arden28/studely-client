// src/api/evaluation.ts
import api, { buildQuery } from "@/api/apiService"

/* ----------------------------- Server DTOs -------------------------------- */

export type AttemptQueueItemDto = {
  id: number
  tenant_id: number
  assessment_id: number
  student_id: number
  started_at?: string | null
  submitted_at?: string | null
  duration_sec?: number | null
  score?: string | number | null
  // included via ->with('assessment','student')
  assessment?: {
    id: number
    title?: string | null
    type?: "online" | "offline" | string | null
  } | null
  student?: {
    id: number
    reg_no?: string | null
    cohort?: string | null
    branch?: string | null
    // if your StudentResource includes user:
    user?: { id: number; name?: string | null; email?: string | null; phone?: string | null } | null
  } | null
  created_at?: string | null
  updated_at?: string | null
}

export type PaginatedDto<T> = {
  data: T[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

/* ------------------------------ UI Types ---------------------------------- */

export type UIQueueItem = {
  id: number
  assessmentId: number
  assessmentTitle?: string
  assessmentType?: string
  studentId: number
  studentRegNo?: string
  studentName?: string
  studentEmail?: string
  cohort?: string
  branch?: string
  startedAt?: string
  submittedAt?: string
  durationSec?: number
  score?: number | null
}

export type ScoreRow = {
  criterion_id: number
  score: number
  comment?: string
}

export type ScoreAttemptPayload = {
  scores: ScoreRow[]
}

/* ------------------------------ Transforms -------------------------------- */

export function toUIQueueItem(a: AttemptQueueItemDto): UIQueueItem {
  return {
    id: a.id,
    assessmentId: a.assessment_id,
    assessmentTitle: a.assessment?.title ?? undefined,
    assessmentType: a.assessment?.type ?? undefined,
    studentId: a.student_id,
    studentRegNo: a.student?.reg_no ?? undefined,
    studentName: a.student?.user?.name ?? undefined,
    studentEmail: a.student?.user?.email ?? undefined,
    cohort: a.student?.cohort ?? undefined,
    branch: a.student?.branch ?? undefined,
    startedAt: a.started_at ?? undefined,
    submittedAt: a.submitted_at ?? undefined,
    durationSec: a.duration_sec ?? undefined,
    score:
      typeof a.score === "string"
        ? Number.parseFloat(a.score)
        : typeof a.score === "number"
        ? a.score
        : null,
  }
}

/* -------------------------------- Client ---------------------------------- */

export type QueueParams = {
  search?: string
  page?: number
  per_page?: number
}

function normalizeQueueParams(params?: QueueParams) {
  if (!params) return undefined
  return params
}

async function queue(params?: QueueParams) {
  const qs = buildQuery(normalizeQueueParams(params))
  const res = await api.get<PaginatedDto<AttemptQueueItemDto>>(`/v1/evaluate/queue${qs}`)
  return {
    ...res,
    data: {
      rows: res.data.data.map(toUIQueueItem),
      meta:
        res.data.meta ??
        ({
          current_page: 1,
          last_page: 1,
          per_page: res.data.data.length,
          total: res.data.data.length,
        } as NonNullable<PaginatedDto<AttemptQueueItemDto>["meta"]>),
    },
  }
}

async function scoreAttempt(attemptId: number, payload: ScoreAttemptPayload) {
  // ScoreAttemptRequest requires { scores: [{ criterion_id, score, comment? }, ...] }
  return api.post(`/v1/attempts/${attemptId}/scores`, payload)
}

export default {
  queue,
  scoreAttempt,
}
