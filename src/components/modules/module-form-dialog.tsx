import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const schema = z.object({
  id: z.number().optional(),
  code: z.string().min(2, "Code is required"),
  title: z.string().min(3, "Title is required"),
  credits: z.number().int().min(0).max(60),
  status: z.enum(["Active", "Archived"]),
  instructor: z.string().min(1, "Instructor is required"),
  cohort: z.string().optional(),
  description: z.string().optional(),
})

export type ModuleFormValues = z.infer<typeof schema>

export function ModuleFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: Partial<ModuleFormValues>
  onSubmit: (values: ModuleFormValues) => Promise<void> | void
  submitting?: boolean
}) {
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      title: "",
      credits: 3,
      status: "Active",
      instructor: "",
      cohort: "",
      description: "",
      ...initial,
    },
    values: initial ? { ...(initial as any) } : undefined,
  })

  React.useEffect(() => {
    if (initial) form.reset(initial as any)
  }, [initial]) // eslint-disable-line

  const submit = form.handleSubmit(async (values) => onSubmit(values))
  const isEdit = Boolean(initial?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Module" : "Create Module"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" {...form.register("code")} />
              {form.formState.errors.code && <p className="text-xs text-red-600">{form.formState.errors.code.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                min={0}
                {...form.register("credits", { valueAsNumber: true })}
              />
              {form.formState.errors.credits && <p className="text-xs text-red-600">{form.formState.errors.credits.message}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v: "Active" | "Archived") => form.setValue("status", v)}
              >
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && <p className="text-xs text-red-600">{form.formState.errors.status.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input id="instructor" placeholder="e.g. Dr. Jane Doe" {...form.register("instructor")} />
              {form.formState.errors.instructor && <p className="text-xs text-red-600">{form.formState.errors.instructor.message}</p>}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cohort">Cohort</Label>
              <Input id="cohort" placeholder="2025-A" {...form.register("cohort")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} placeholder="Optional short description…" {...form.register("description")} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
