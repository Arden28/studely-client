// src/components/students/student-form-dialog.tsx
"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const schema = z.object({
  id: z.number().optional(),

  // user fields
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),

  // student fields
  reg_no: z.string().min(1, "Registration no. is required"),
  cohort: z.string().optional(),
  branch: z.string().optional(),

  /** Accept object or JSON string for meta */
  meta: z
    .union([z.record(z.any()), z.string().trim().length(0), z.string()])
    .optional()
    .superRefine((val, ctx) => {
      if (typeof val === "string" && val.trim().length > 0) {
        try {
          const parsed = JSON.parse(val)
          if (!parsed || typeof parsed !== "object") {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Meta must be a JSON object" })
          }
        } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON" })
        }
      }
    }),
})

export type StudentFormValues = z.infer<typeof schema>

export function StudentFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: Partial<StudentFormValues>
  onSubmit: (values: StudentFormValues) => Promise<void> | void
  submitting?: boolean
}) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      reg_no: "",
      cohort: "",
      branch: "",
      meta: "",
      ...(initial ?? {}),
    },
  })

  React.useEffect(() => {
    if (initial) {
      const metaField =
        typeof initial.meta === "object" && initial.meta != null
          ? JSON.stringify(initial.meta, null, 2)
          : (initial.meta as any) ?? ""
      form.reset({ ...initial, meta: metaField })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  const isEdit = Boolean(initial?.id)

  const handleSubmit = form.handleSubmit(async (values) => {
    let meta: Record<string, unknown> | undefined
    if (typeof values.meta === "string") {
      const t = values.meta.trim()
      if (t) {
        try {
          const parsed = JSON.parse(t)
          if (parsed && typeof parsed === "object") meta = parsed as Record<string, unknown>
        } catch {
          /* schema already shows error; guard anyway */
        }
      }
    } else if (values.meta && typeof values.meta === "object") {
      meta = values.meta as Record<string, unknown>
    }

    await onSubmit({ ...values, meta })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Student" : "Create Student"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: User */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Brian Mwangi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="brian@school.ac.ke" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: phone + reg no */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+254 7XX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reg_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration No.</FormLabel>
                    <FormControl>
                      <Input placeholder="KEMU-2025-00123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: cohort + branch */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="cohort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cohort</FormLabel>
                    <FormControl>
                      <Input placeholder="2025-A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input placeholder="Nairobi / Parklands" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 4: meta full width */}
            <FormField
              control={form.control}
              name="meta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta (JSON, optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder='e.g. { "guardian": "Jane Doe", "emergencyPhone": "+254..." }'
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
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
