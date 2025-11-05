// src/components/Students.columns.tsx
"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { UIStudent } from "@/api/student"

export function buildStudentColumns(
  onEdit: (s: UIStudent) => void,
  onDelete: (s: UIStudent) => void
): ColumnDef<UIStudent, unknown>[] {
  const cols: ColumnDef<UIStudent, unknown>[] = [
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => row.userName ?? "—",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.userName ?? "—"}</span>
          <span className="text-xs text-muted-foreground">{row.original.userEmail ?? "—"}</span>
        </div>
      ),
      sortingFn: "alphanumeric",
    },
    {
      id: "regNo",
      header: "Reg No.",
      accessorKey: "regNo",
      cell: ({ getValue }) => <span className="font-mono">{String(getValue() ?? "—")}</span>,
    },
    {
      id: "cohort",
      header: "Cohort",
      accessorKey: "cohort",
      cell: ({ getValue }) => <span>{(getValue() as string) || "—"}</span>,
      enableGrouping: true,
    },
    {
      id: "branch",
      header: "Branch",
      accessorKey: "branch",
      cell: ({ getValue }) => <span>{(getValue() as string) || "—"}</span>,
      enableGrouping: true,
    },
    {
      id: "phone",
      header: "Phone",
      accessorFn: (row) => row.userPhone ?? "",
      cell: ({ row }) => <span>{row.original.userPhone ?? "—"}</span>,
      enableHiding: true,
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ getValue }) => {
        const v = getValue() as string | undefined
        if (!v) return "—"
        // show YYYY-MM-DD
        return v.slice(0, 10)
      },
      enableHiding: true,
    },
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const s = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(s)}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(s)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
  ]

  return cols
}

export type { UIStudent } // re-export for convenience if needed
