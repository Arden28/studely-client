import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UIModule } from "@/api/module"


export function buildModuleColumns(
  onEdit: (m: UIModule) => void,
  onDelete: (m: UIModule) => void,
  user?: { role?: string }
): ColumnDef<UIModule>[] {
  
  
  return [
    {
      accessorKey: "title",
      header: "Title",
      filterFn: "fuzzy",
    },
    {
      accessorKey: "assessmentTitle",
      header: "Assessment",
      // Use the flattened field; if missing, fall back to the first assessment title if `assessment` is an array.
      cell: ({ row, getValue }) => {
        const flat = getValue() as string | undefined
        if (flat && flat.trim()) return flat
        const a = row.original.assessment as any
        if (Array.isArray(a) && a.length) return a[0]?.title ?? "—"
        if (a && typeof a === "object") return a.title ?? "—"
        return "—"
      },
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
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableHiding: true,
      cell: ({ row }) => {
        const m = row.original

        if (user?.role !== "SuperAdmin") return null;

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
