"use client"

import * as React from "react"
import { DataTable, type DataTableExtraFilter } from "@/components/data-table"
import { buildCollegeColumns } from "@/components/colleges/Colleges.columns"
import { CollegeFormDialog, type CollegeFormValues } from "@/components/colleges/college-form-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import collegesApi, { type UICollege } from "@/api/college"
import useAuth from "@/hooks/useAuth"

type Query = {
  search?: string
  location?: string
}

export default function Colleges() {
  const [loading, setLoading] = React.useState(true)
  const { user } = useAuth()
  const [rows, setRows] = React.useState<UICollege[]>([])
  const [total, setTotal] = React.useState(0)
  const [query, setQuery] = React.useState<Query>({
    search: "",
    location: "",
  })

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<UICollege | null>(null)
  const [initialForm, setInitialForm] = React.useState<Partial<CollegeFormValues> | undefined>()
  const [saving, setSaving] = React.useState(false)

  /* ---------------------------- Fetch Colleges ---------------------------- */
  const fetchColleges = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await collegesApi.list({
        search: query.search,
        location: query.location,
        page: 1,
        per_page: 20,
      })
      setRows(res.data.rows)
      setTotal(res.data.meta.total)
    } catch (e: any) {
      toast(e?.message ?? "Failed to load colleges")
    } finally {
      setLoading(false)
    }
  }, [query])

  React.useEffect(() => {
    fetchColleges()
  }, [fetchColleges])

  /* ---------------------------- Dialog Actions ---------------------------- */
  function openCreate() {
    setEditing(null)
    setInitialForm(undefined)
    setDialogOpen(true)
  }

  function openEdit(c: UICollege) {
    setEditing(c)
    setInitialForm({
      id: c.id,
      name: c.name ?? "",
      code: c.code ?? "",
      location: c.location ?? "",
      description: c.description ?? "",
    })
    setDialogOpen(true)
  }

  /* ---------------------------- Create / Update ---------------------------- */
  async function saveCollege(values: CollegeFormValues) {
    setSaving(true)
    try {
      if (values.id) {
        // EDIT
        await collegesApi.update(values.id, {
          name: values.name,
          code: values.code,
          location: values.location,
          description: values.description,
        })
        toast("College updated.")
      } else {
        // CREATE
        await collegesApi.create({
          name: values.name,
          code: values.code,
          location: values.location,
          description: values.description,
        })
        toast("College created.")
      }
      setDialogOpen(false)
      fetchColleges()
    } catch (e: any) {
      toast(e?.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function removeCollege(c: UICollege) {
    if (!confirm(`Delete ${c.name}?`)) return
    try {
      await collegesApi.remove(c.id)
      toast("College deleted.")
      fetchColleges()
    } catch (e: any) {
      toast(e?.message ?? "Delete failed")
    }
  }

  /* ---------------------------- Table Columns ---------------------------- */
  const columns = React.useMemo(
    () => buildCollegeColumns(openEdit, removeCollege, user ?? undefined),
    [] // eslint-disable-line
  )

  const extraFilters: DataTableExtraFilter[] = [
    {
      key: "location",
      label: `Location: ${query.location}`,
      value: query.location,
      onClear: () => setQuery((q) => ({ ...q, location: "" })),
    },
  ]

  /* ---------------------------- UI Layout ---------------------------- */
  return (
    <div className="space-y-4">
      {/* Header + actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Colleges</h2>
          <p className="text-sm text-muted-foreground">
            Manage registered colleges and their key details.
          </p>
        </div>
        <Button onClick={openCreate}>Add College</Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by name, code, or location…"
          className="w-52"
          value={query.search}
          onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchColleges()
          }}
        />

        <Button variant="outline" onClick={fetchColleges}>
          Apply
        </Button>
        <Button
          variant="ghost"
          onClick={() => setQuery({ search: "", location: "" })}
        >
          Reset
        </Button>
      </div>

      <Separator />

      {/* Table */}
      <DataTable<UICollege, unknown>
        columns={columns}
        data={rows}
        loading={loading}
        globalFilterPlaceholder="Quick search…"
        extraFilters={extraFilters}
        groupableColumns={[{ id: "location", label: "Location" }]}
      />

      {/* Dialog */}
      <CollegeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={initialForm}
        onSubmit={saveCollege}
        submitting={saving}
      />
    </div>
  )
}
