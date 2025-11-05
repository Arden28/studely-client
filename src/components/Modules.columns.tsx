import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type ModuleRow = {
  id: number
  code: string
  title: string
  credits: number
  status: "Active" | "Archived"
  instructor: string
  cohort?: string
  assessmentsCount?: number
  studentsCount?: number
  created_at?: string
}

export function buildModuleColumns(
  onEdit: (m: ModuleRow) => void,
  onDelete: (m: ModuleRow) => void
): ColumnDef<ModuleRow>[] {
  return [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <div className="font-medium">{row.original.code}</div>,
      filterFn: "fuzzy",
    },
    {
      accessorKey: "title",
      header: "Title",
      filterFn: "fuzzy",
    },
    { accessorKey: "credits", header: "Credits" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "Active" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    { accessorKey: "instructor", header: "Instructor", filterFn: "fuzzy" },
    { accessorKey: "cohort", header: "Cohort" },
    {
      accessorKey: "assessmentsCount",
      header: "Assessments",
      cell: ({ row }) => row.original.assessmentsCount ?? 0,
    },
    {
      accessorKey: "studentsCount",
      header: "Students",
      cell: ({ row }) => row.original.studentsCount ?? 0,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const m = row.original
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(m)}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(m)}>Delete</Button>
          </div>
        )
      },
    },
  ]
}
