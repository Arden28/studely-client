import * as React from "react"
import { DataTable, type DataTableExtraFilter } from "@/components/data-table"
import { ModuleFormDialog, type ModuleFormValues } from "@/components/modules/module-form-dialog"
import { buildModuleColumns, type ModuleRow } from "@/components/Modules.columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import apiService, { ApiError } from "@/api/apiService"

type Query = {
  search?: string
  status?: "Active" | "Archived" | ""
  instructor?: string
  cohort?: string
}

export default function Modules() {
  const [loading, setLoading] = React.useState(true)
  const [rows, setRows] = React.useState<ModuleRow[]>([])
  const [total, setTotal] = React.useState(0)
  const [query, setQuery] = React.useState<Query>({ search: "", status: "", instructor: "", cohort: "" })

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ModuleRow | null>(null)
  const [saving, setSaving] = React.useState(false)

  const fetchModules = React.useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (query.search) q.set("search", query.search)
      if (query.status) q.set("status", query.status)
      if (query.instructor) q.set("instructor", query.instructor)
      if (query.cohort) q.set("cohort", query.cohort)

      const res = await apiService.get<{ data: ModuleRow[]; total: number }>(`/v1/modules?${q.toString()}`)
      setRows(res.data.data ?? [])
      setTotal(res.data.total ?? 0)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to load modules"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [query])

  React.useEffect(() => { fetchModules() }, [fetchModules])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }
  function openEdit(m: ModuleRow) {
    setEditing(m)
    setDialogOpen(true)
  }

  async function saveModule(values: ModuleFormValues) {
    setSaving(true)
    try {
      if (editing?.id) {
        await apiService.put(`/v1/modules/${editing.id}`, values)
        toast("Module updated.")
      } else {
        await apiService.post(`/v1/modules`, values)
        toast("Module created.")
      }
      setDialogOpen(false)
      fetchModules()
    } catch (e) {
      const msg = e instanceof ApiError ? (e.payload?.message || e.message) : "Save failed"
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  async function removeModule(m: ModuleRow) {
    if (!confirm(`Delete module ${m.code} – ${m.title}?`)) return
    try {
      await apiService.delete(`/v1/modules/${m.id}`)
      toast("Module deleted.")
      fetchModules()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Delete failed"
      toast.error(msg)
    }
  }

  const columns = React.useMemo(
    () => buildModuleColumns(openEdit, removeModule),
    [] // eslint-disable-line
  )

  const extraFilters: DataTableExtraFilter[] = [
    {
      key: "status",
      label: `Status: ${query.status}`,
      value: query.status,
      onClear: () => setQuery((q) => ({ ...q, status: "" })),
    },
    {
      key: "instructor",
      label: `Instructor: ${query.instructor}`,
      value: query.instructor,
      onClear: () => setQuery((q) => ({ ...q, instructor: "" })),
    },
    {
      key: "cohort",
      label: `Cohort: ${query.cohort}`,
      value: query.cohort,
      onClear: () => setQuery((q) => ({ ...q, cohort: "" })),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Modules</h2>
          <p className="text-sm text-muted-foreground">Create, edit, archive modules and manage instructors.</p>
        </div>
        <Button onClick={openCreate}>Add Module</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search code/title/instructor…"
          className="w-60"
          value={query.search}
          onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") fetchModules() }}
        />
        <Select
          value={query.status ? query.status : "all"}
          onValueChange={(v: "Active" | "Archived" | "all") =>
            setQuery((q) => ({ ...q, status: v === "all" ? "" : v }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Instructor"
          className="w-44"
          value={query.instructor}
          onChange={(e) => setQuery((q) => ({ ...q, instructor: e.target.value }))}
        />
        <Input
          placeholder="Cohort (e.g., 2025-A)"
          className="w-40"
          value={query.cohort}
          onChange={(e) => setQuery((q) => ({ ...q, cohort: e.target.value }))}
        />
        <Button variant="outline" onClick={() => fetchModules()}>Apply</Button>
        <Button
          variant="ghost"
          onClick={() => setQuery({ search: "", status: "", instructor: "", cohort: "" })}
        >
          Reset
        </Button>
      </div>

      <Separator />

      {/* Table */}
      <DataTable<ModuleRow, unknown>
        columns={columns}
        data={rows}
        loading={loading}
        globalFilterPlaceholder="Quick search…"
        extraFilters={extraFilters}
        groupableColumns={[
          { id: "status", label: "Status" },
          { id: "instructor", label: "Instructor" },
          { id: "cohort", label: "Cohort" },
        ]}
      />

      {/* Dialog */}
      <ModuleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing ?? undefined}
        onSubmit={saveModule}
        submitting={saving}
      />
    </div>
  )
}
