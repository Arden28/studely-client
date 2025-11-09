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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ---------------------- schema ----------------------
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

  // Extended profile (persisted in meta)
  gov_full_name: z.string().optional(),          // Full Name as in Govt ID
  institution_name: z.string().optional(),
  university_name: z.string().optional(),
  gender: z.enum(["male", "female", "other", "na"]).optional(),
  dob: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}/.test(v), "Use YYYY-MM-DD"),
  admission_year: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}$/.test(v), "Use 4-digit year, e.g. 2023"),
  current_semester: z.string().optional(),

  // keep meta as an object type (not bound directly to textarea)
  meta: z.record(z.string(), z.unknown()).optional(),

  // bind textarea to a plain string (raw editable JSON)
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
export type StudentFormValues = z.infer<typeof schema>

// ---------------------- helpers ----------------------
function pick<T extends Record<string, any>>(obj: T | undefined, key: string): string {
  if (!obj) return ""
  const v = obj[key]
  return (v == null ? "" : String(v)) as string
}

function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const k in obj) {
    const v = obj[k]
    // keep false/0, drop "", null, undefined
    if (v !== "" && v != null) out[k] = v
  }
  return out
}

// ---------------------- component ----------------------
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

      // extended (from meta)
      gov_full_name: "",
      institution_name: "",
      university_name: "",
      gender: "na",
      dob: "",
      admission_year: "",
      current_semester: "",

      meta: undefined,
      meta_text: "",
      ...(initial ?? {}),
    },
  })

  // Reset + hydrate extended fields from initial.meta when editing
  React.useEffect(() => {
    if (!initial) return

    const m = (initial.meta ?? {}) as Record<string, unknown>

    form.reset({
      ...form.getValues(), // keep previous defaults if not provided
      ...initial,
      // Prefer explicit initial fields if they were passed, else fallback to meta
      gov_full_name: (initial as any).gov_full_name ?? pick(m, "gov_full_name"),
      institution_name: (initial as any).institution_name ?? pick(m, "institution_name"),
      university_name: (initial as any).university_name ?? pick(m, "university_name"),
      gender: ((initial as any).gender || pick(m, "gender") || "na") as any,
      dob: (initial as any).dob ?? pick(m, "dob"),
      admission_year: (initial as any).admission_year ?? pick(m, "admission_year"),
      current_semester: (initial as any).current_semester ?? pick(m, "current_semester"),
      meta_text:
        initial.meta && typeof initial.meta === "object"
          ? JSON.stringify(initial.meta, null, 2)
          : "",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  const isEdit = Boolean(initial?.id)

  const handleSubmit = form.handleSubmit(async (values) => {
    // Parse meta from textarea (if any)
    let baseMeta: Record<string, unknown> | undefined
    const t = (values.meta_text ?? "").trim()
    if (t) {
      try {
        baseMeta = JSON.parse(t) as Record<string, unknown>
      } catch {
        // schema already reports error; guard anyway
      }
    }

    // Merge in extended profile fields into meta
    const extended = compact({
      gov_full_name: values.gov_full_name?.trim(),
      institution_name: values.institution_name?.trim(),
      university_name: values.university_name?.trim(),
      gender: values.gender,
      dob: values.dob, // already validated YYYY-MM-DD
      admission_year: values.admission_year?.trim(),
      current_semester: values.current_semester?.trim(),
    })

    const meta = {
      ...(baseMeta ?? {}),
      ...extended,
    }

    // Build payload without meta_text & extended display fields
    const {
      meta_text,
      gov_full_name,
      institution_name,
      university_name,
      gender,
      dob,
      admission_year,
      current_semester,
      ...rest
    } = values

    const payload = { ...rest, meta } as StudentFormValues

    await onSubmit(payload)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ⬇️ Constrain height and enable vertical scrolling */}
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Student" : "Create Student"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Account & Contact */}
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Account & Contact</div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
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

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
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
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="REG-001 / KEMU-2025-00123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section: Education Placement */}
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Education Placement</div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="institution_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. School of Computing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="university_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kenya Methodist University" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-4">
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
            </div>

            {/* Section: Govt Identity Name */}
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Identity</div>
              <div className="grid gap-4 md:grid-cols-2">
                {/* <FormField
                  control={form.control}
                  name="gov_full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (Govt ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="As on National ID / Passport" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? "na"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="na">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-4">

                <FormField
                  control={form.control}
                  name="admission_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year of Admission</FormLabel>
                      <FormControl>
                        <Input type="text" inputMode="numeric" placeholder="e.g. 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="current_semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Semester</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </div>

            {/* Section: Meta JSON */}
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
                        placeholder='e.g. { "guardian": "Jane Doe", "emergencyPhone": "+254..." }'
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
