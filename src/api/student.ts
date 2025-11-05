// src/api/student.ts
import api, { buildQuery } from "@/api/apiService"

/* ----------------------------- Server DTOs -------------------------------- */

export type StudentDto = {
  id: number
  name: string,
  email: string,
  phone?: string | null,
  tenant_id: number
  user_id: number | null
  reg_no: string
  branch?: string | null
  cohort?: string | null
  meta?: Record<string, unknown> | null
  user?: { id: number; name: string; email?: string | null; phone?: string | null } | null
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

export type UIStudent = {
  id: number
  regNo: string
  branch?: string
  cohort?: string
  meta?: Record<string, unknown>
  userId?: number | null
  userName?: string | null
  userEmail?: string | null
  userPhone?: string | null
  createdAt?: string
  updatedAt?: string
}

export type UIStudentCreate = {
  // user
  name: string
  email: string
  phone?: string
  // student
  reg_no: string
  branch?: string
  cohort?: string
  meta?: Record<string, unknown> | undefined
}

export type UIStudentUpdate = Partial<UIStudentCreate>

/* ------------------------------ Transforms -------------------------------- */

export function toUIStudent(s: StudentDto): UIStudent {
  return {
    id: s.id,
    regNo: s.reg_no,
    branch: s.branch ?? undefined,
    cohort: s.cohort ?? undefined,
    meta: s.meta ?? undefined,
    userId: s.user_id ?? null,
    userName: s.name ?? null,
    userEmail: s.email ?? null,
    userPhone: s.phone ?? null,
    createdAt: s.created_at ?? undefined,
    updatedAt: s.updated_at ?? undefined,
  }
}

function normalizeListParams(params?: Record<string, unknown>) {
  if (!params) return undefined
  const out = { ...params }
  if (Array.isArray(out.with)) (out as any).with = (out.with as string[]).join(",")
  return out
}

/* -------------------------------- Client ---------------------------------- */

async function list(params?: { search?: string; cohort?: string; branch?: string; page?: number; per_page?: number; with?: ("user")[] }) {
  const qs = buildQuery(normalizeListParams(params))
  const res = await api.get<PaginatedDto<StudentDto>>(`/v1/students${qs}`)
  return {
    ...res,
    data: {
      rows: res.data.data.map(toUIStudent),
      meta:
        res.data.meta ??
        ({
          current_page: 1,
          last_page: 1,
          per_page: res.data.data.length,
          total: res.data.data.length,
        } as NonNullable<PaginatedDto<StudentDto>["meta"]>),
    },
  }
}

/**
 * Create Student + (optionally) User in one call by sending a nested "user" object.
 * Requires backend to accept { reg_no, cohort, branch, meta, user: { name, email, phone? } }.
 */
async function createWithUser(payload: UIStudentCreate) {
  const body: Record<string, unknown> = {
    reg_no: payload.reg_no.trim(),
    branch: (payload.branch ?? "").trim() || null,
    cohort: (payload.cohort ?? "").trim() || null,
    meta: payload.meta ?? null,
    user: {
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: (payload.phone ?? "").trim() || null,
    },
  }
  const res = await api.post<StudentDto, typeof body>(`/v1/students`, body)
  return { ...res, data: toUIStudent(res.data) }
}

async function update(id: number, payload: UIStudentUpdate) {
  const body: Record<string, unknown> = {}
  if (payload.reg_no !== undefined) body.reg_no = String(payload.reg_no).trim()
  if (payload.branch !== undefined) body.branch = payload.branch?.trim() || null
  if (payload.cohort !== undefined) body.cohort = payload.cohort?.trim() || null
  if (payload.meta !== undefined) body.meta = payload.meta ?? null

  // Optional: allow updating linked user's basic fields if backend supports it
  if (payload.name !== undefined || payload.email !== undefined || payload.phone !== undefined) {
    body.user = {
      ...(payload.name !== undefined ? { name: payload.name?.trim() || null } : {}),
      ...(payload.email !== undefined ? { email: payload.email?.trim() || null } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone?.trim() || null } : {}),
    }
  }

  const res = await api.patch<StudentDto, typeof body>(`/v1/students/${id}`, body)
  return { ...res, data: toUIStudent(res.data) }
}

async function remove(id: number) {
  return api.delete<null>(`/v1/students/${id}`)
}

export default {
  list,
  createWithUser,
  update,
  remove,
}
