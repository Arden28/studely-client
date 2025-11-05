"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils" // if you don't have cn, remove cn() usages

/** ----------------------- Schema ----------------------- */
const schema = z
  .object({
    id: z.number().optional(),
    title: z.string().min(3, "Title is required"),
    type: z.enum(["online", "offline"], { required_error: "Type is required" }),
    category: z.string().min(1, "Category is required"),
    module: z.string().min(1, "Module is required"),
    cohort: z.string().optional(),
    start_at: z.date().nullable().optional(),
    end_at: z.date().nullable().optional(),
    duration_minutes: z.number().int().positive().max(1000).optional(),
    total_marks: z.number().int().positive().max(100000).optional(),
    description: z.string().optional(),
  })
  .refine(
    (v) => {
      if (v.start_at && v.end_at) return v.end_at >= v.start_at
      return true
    },
    { message: "End must be after Start", path: ["end_at"] }
  )

export type AssessmentFormValues = z.infer<typeof schema>

/** -------------------- DateTimePicker -------------------- */
/** Calendar + time, with collision handling and scroll-safe content. */
function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  disabled,
}: {
  value?: Date | null
  onChange: (d: Date | null) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)

  const timeStr = React.useMemo(() => {
    if (!value) return ""
    const hh = String(value.getHours()).padStart(2, "0")
    const mm = String(value.getMinutes()).padStart(2, "0")
    return `${hh}:${mm}`
  }, [value])

  const setTime = (date: Date | null, hhmm: string) => {
    if (!date) return onChange(null)
    const [hh, mm] = hhmm.split(":").map((n) => Number(n) || 0)
    const next = new Date(date)
    next.setHours(hh, mm, 0, 0)
    onChange(next)
  }

  // Ensure we always have a Date when typing time first
  const ensureDate = () => value ?? new Date()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "yyyy-MM-dd HH:mm") : placeholder}
        </Button>
      </PopoverTrigger>

      {/* Popper handles reposition; content itself is scroll-bounded to avoid overflow */}
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        className="p-0 w-[320px] max-h-[70vh] overflow-auto"
      >
        <div className="flex flex-col gap-2 p-2">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(d) => onChange(d ?? null)}
            initialFocus
          />

          <div className="px-2 pb-2">
            <Label htmlFor="time" className="mb-1 block text-xs text-muted-foreground">
              Time (HH:mm)
            </Label>
            <Input
              id="time"
              type="time"
              value={timeStr}
              onChange={(e) => setTime(ensureDate(), e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 px-2 pb-2">
            <Button type="button" variant="outline" onClick={() => onChange(null)}>
              Clear
            </Button>
            <Button type="button" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** -------------------- Main Dialog -------------------- */
export function AssessmentFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: Partial<AssessmentFormValues & { start_at?: string; end_at?: string }>
  onSubmit: (
    values: AssessmentFormValues & { start_at?: string | null; end_at?: string | null }
  ) => Promise<void> | void
  submitting?: boolean
}) {
  const parseMaybeDate = (s?: string | Date | null) => {
    if (!s) return null
    if (s instanceof Date) return s
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d
  }

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      type: "online",
      category: "",
      module: "",
      cohort: "",
      start_at: null,
      end_at: null,
      duration_minutes: 30,
      total_marks: 100,
      description: "",
      ...(initial
        ? {
            ...initial,
            start_at: parseMaybeDate(initial.start_at),
            end_at: parseMaybeDate(initial.end_at),
          }
        : {}),
    },
  })

  React.useEffect(() => {
    if (initial) {
      form.reset({
        title: initial.title ?? "",
        type: (initial.type as "online" | "offline") ?? "online",
        category: initial.category ?? "",
        module: initial.module ?? "",
        cohort: initial.cohort ?? "",
        start_at: parseMaybeDate(initial.start_at),
        end_at: parseMaybeDate(initial.end_at),
        duration_minutes:
          typeof initial.duration_minutes === "number" ? initial.duration_minutes : 30,
        total_marks: typeof initial.total_marks === "number" ? initial.total_marks : 100,
        description: initial.description ?? "",
        id: (initial as any)?.id,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  const isEdit = Boolean((initial as any)?.id)
  const toApiDate = (d?: Date | null) => (d ? format(d, "yyyy-MM-dd HH:mm") : null)

  const submit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      start_at: toApiDate(values.start_at),
      end_at: toApiDate(values.end_at),
    }
    await onSubmit(payload as any)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* allow popovers above by not clipping; DialogContent portals popovers anyway, but this prevents odd clipping effects */}
      <DialogContent className="sm:max-w-2xl overflow-visible">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Assessment" : "Create Assessment"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={submit} className="space-y-6">
            {/* Row 1 */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Midterm Exam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Assessment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online (MCQ / Essay)</SelectItem>
                          <SelectItem value="offline">Offline (Panelist Scores)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2 */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Aptitude / Logic / Soft Skills…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <FormControl>
                      <Input placeholder="Module code or name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>

            {/* Row 3: Date/Time & Duration */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="start_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start</FormLabel>
                    <FormControl>
                      <DateTimePicker value={field.value ?? null} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End</FormLabel>
                    <FormControl>
                      <DateTimePicker value={field.value ?? null} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={1000}
                        inputMode="numeric"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 4: Total Marks */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="total_marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Marks</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100000}
                        inputMode="numeric"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* spacer to keep grid symmetry on md+; description gets full row below */}
              <div className="hidden md:block" />
            </div>

            {/* Row 5: Description (full width) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Optional details…"
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
