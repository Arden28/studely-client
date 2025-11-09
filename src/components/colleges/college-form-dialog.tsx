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

// ---------------------- schema ----------------------
const schema = z.object({
  id: z.number().optional(),

  name: z.string().min(2, "College name is required"),
  code: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),

  // Optional meta JSON for extra attributes
  meta: z.record(z.string(), z.unknown()).optional(),
  meta_text: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      const t = (val ?? "").trim()
      if (!t) return
      try {
        const parsed = JSON.parse(t)
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Meta must be a JSON object" })
        }
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON" })
      }
    }),
})

export type CollegeFormValues = z.infer<typeof schema>

// ---------------------- helpers ----------------------
function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const k in obj) {
    const v = obj[k]
    if (v !== "" && v != null) out[k] = v
  }
  return out
}

// ---------------------- component ----------------------
export function CollegeFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: Partial<CollegeFormValues>
  onSubmit: (values: CollegeFormValues) => Promise<void> | void
  submitting?: boolean
}) {
  const form = useForm<CollegeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      location: "",
      description: "",
      meta: undefined,
      meta_text: "",
      ...(initial ?? {}),
    },
  })

  // Reset + hydrate meta from initial when editing
  React.useEffect(() => {
    if (!initial) return
    form.reset({
      ...form.getValues(),
      ...initial,
      meta_text:
        initial.meta && typeof initial.meta === "object"
          ? JSON.stringify(initial.meta, null, 2)
          : "",
    })
  }, [initial])

  const isEdit = Boolean(initial?.id)

  const handleSubmit = form.handleSubmit(async (values) => {
    // Parse meta JSON from textarea
    let baseMeta: Record<string, unknown> | undefined
    const t = (values.meta_text ?? "").trim()
    if (t) {
      try {
        baseMeta = JSON.parse(t) as Record<string, unknown>
      } catch {
        // schema already validates; guard anyway
      }
    }

    const payload = {
      ...values,
      meta: baseMeta,
    }
    delete payload.meta_text

    await onSubmit(payload)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit College" : "Create College"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* College core fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. School of Computing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nairobi Campus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Optional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Meta JSON */}
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Meta (optional)</div>
              <FormField
                control={form.control}
                name="meta_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta JSON</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder='e.g. { "dean": "John Doe", "established": 2010 }'
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
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
