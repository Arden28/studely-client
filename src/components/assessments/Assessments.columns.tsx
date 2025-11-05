import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UIAssessment } from "@/api/assessment"

export function buildAssessmentColumns(
  onEdit: (a: UIAssessment) => void,
  onDelete: (a: UIAssessment) => void,
  onLaunch: (a: UIAssessment) => void
): ColumnDef<UIAssessment>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      filterFn: "fuzzy",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    { accessorKey: "module_title", header: "Module", filterFn: "fuzzy" },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const a = row.original
        const now = new Date().toISOString()
        const scheduled = a.open_at && a.open_at > now
        const closed = a.close_at && a.close_at < now
        const label = scheduled ? "Scheduled" : closed ? "Closed" : a.is_active ? "Active" : "Inactive"
        const variant = label === "Active" ? "default" : label === "Scheduled" ? "secondary" : "outline"
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      accessorKey: "questions_count",
      header: "Questions",
    },
    {
      accessorKey: "attempts_count",
      header: "Attempts",
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const a = row.original
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(a)}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(a)}>Delete</Button>
            <Button size="sm" onClick={() => onLaunch(a)}>Launch</Button>
          </div>
        )
      },
    },
  ]
}
