import api, { buildQuery } from "@/api/apiService"
import type { AssessmentDto, UIAssessment } from "./assessment"

/* ----------------------------- Server DTOs -------------------------------- */

export type ModuleDto = {
  id: number
  assessment_title: string,
  code: string
  title: string
  credits: number
  status: "Active" | "Archived"
  instructor?: string | null
  cohort?: string | null
  assessments_count?: number
  assessment?: AssessmentDto[] | null
  students_count?: number
  created_at?: string
}

/* ------------------------------ UI Types ---------------------------------- */

export type UIModule = {
  id: number
  assessmentTitle: string,
  code: string
  title: string
  credits: number
  status: "Active" | "Archived"
  instructor?: string | null
  cohort?: string | null
  assessmentsCount?: number
  assessment?: any | null;
  studentsCount?: number
  createdAt?: string
}

export type ListQuery = {
  search?: string
  status?: "Active" | "Archived"
  instructor?: string
  cohort?: string
  page?: number
  per_page?: number
}

/* ------------------------------ Transforms -------------------------------- */

export function toUIModule(m: ModuleDto): UIModule {
    console.info("Module: ", m)
  return {
    id: m.id,
    assessmentTitle: m.assessment_title,
    code: m.code,
    title: m.title,
    credits: m.credits,
    status: m.status,
    instructor: m.instructor ?? null,
    cohort: m.cohort ?? null,
    assessmentsCount: m.assessments_count ?? 0,
    assessment: m.assessment ?? null,
    studentsCount: m.students_count ?? 0,
    createdAt: m.created_at ?? undefined,
  }
}

function normalizeListParams(params?: ListQuery) {
  if (!params) return undefined
  const out: Record<string, any> = { ...params }
  return out
}

/* -------------------------------- Client ---------------------------------- */

async function list(params?: ListQuery) {
  const qs = buildQuery(normalizeListParams(params))
  const res = await api.get<{ data: ModuleDto[]; meta?: any }>(`/v1/modules${qs}`)
  const rows = (res.data.data ?? []).map(toUIModule)
  return { ...res, data: { rows, meta: res.data.meta } }
}

async function get(id: number) {
  const res = await api.get<{ data: ModuleDto }>(`/v1/modules/${id}`)
  return { ...res, data: toUIModule(res.data.data) }
}

async function create(payload: Partial<ModuleDto>) {
  const res = await api.post<{ data: ModuleDto }, Partial<ModuleDto>>(`/v1/modules`, payload)
  return { ...res, data: toUIModule(res.data.data) }
}

async function update(id: number, payload: Partial<ModuleDto>) {
  const res = await api.put<{ data: ModuleDto }, Partial<ModuleDto>>(`/v1/modules/${id}`, payload)
  return { ...res, data: toUIModule(res.data.data) }
}

async function remove(id: number) {
  return api.delete(`/v1/modules/${id}`)
}

const modulesApi = {
  list,
  get,
  create,
  update,
  remove,
}

export default modulesApi
