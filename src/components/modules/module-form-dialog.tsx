"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import assessmentsApi, {  type UIAssessment } from "@/api/assessment"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

/** ----------------------- Schema ----------------------- */
const statusEnum = ["Active", "Archived"] as const

const schema = z.object({
  id: z.number().optional(),
  code: z.string().min(2, "Code is required"),
  title: z.string().min(3, "Title is required"),
  credits: z.number().int().min(0).max(60),
  status: z.enum(statusEnum),
  assessment_id: z.number().int().positive({ message: "Select an assessment" }),
})

export type ModuleFormValues = z.infer<typeof schema>

/** -------------------- Main Dialog -------------------- */
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
  const [assessments, setAssessments] = React.useState<UIAssessment[]>([])
  const [loading, setLoading] = React.useState(true)

  // Fetch assessments on mount
  React.useEffect(() => {
    let cancelled = false
    async function fetchAssessments() {
      try {
        setLoading(true)
        const res = await assessmentsApi.list({ status: "active" })
        if (!cancelled) setAssessments(res.data.rows)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAssessments()
    return () => {
      cancelled = true
    }
  }, [])

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      title: "",
      credits: 3,
      status: "Active",
      assessment_id: undefined as unknown as number,
      ...initial,
    },
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

        <Form {...form}>
          <form onSubmit={submit} className="space-y-6">
            {/* Row 1: Code & Credits */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CS101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Title & Status */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Introduction to CS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusEnum.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: Assessment */}
            <FormField
              control={form.control as any}
              name="assessment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(Number(v))}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Loading..." : "Select assessment"} />
                      </SelectTrigger>
                      <SelectContent>
                        {assessments.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : isEdit ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
