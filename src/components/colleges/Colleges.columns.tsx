"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UICollege } from "@/api/college"

export function buildCollegeColumns(
  onEdit: (c: UICollege) => void,
  onDelete: (c: UICollege) => void,
  user?: { role?: string }
): ColumnDef<UICollege, unknown>[] {
  const cols: ColumnDef<UICollege, unknown>[] = [
    {
      id: "code",
      header: "Code",
      accessorKey: "code",
      cell: ({ getValue }) => (
        <span className="font-mono uppercase">{String(getValue() ?? "—")}</span>
      ),
      size: 100,
    },
    {
      id: "name",
      header: "College Name",
      accessorKey: "name",
      cell: ({ getValue }) => <span className="font-medium">{(getValue() as string) || "—"}</span>,
      sortingFn: "alphanumeric",
      size: 200,
    },
    {
      id: "location",
      header: "Location",
      accessorKey: "location",
      cell: ({ getValue }) => <span>{(getValue() as string) || "—"}</span>,
      enableGrouping: true,
      size: 180,
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      cell: ({ getValue }) => {
        const v = (getValue() as string) || ""
        return (
          <span className="line-clamp-1 text-muted-foreground">
            {v.length > 0 ? v : "—"}
          </span>
        )
      },
    },
    {
      id: "createdAt",
      header: "Created On",
      accessorKey: "createdAt",
      cell: ({ getValue }) => {
        const v = getValue() as string | undefined
        return v ? v.slice(0, 10) : "—"
      },
      size: 120,
    },
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const c = row.original

        if (user?.role !== "SuperAdmin") return null;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(c)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(c)}
              >
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

export type { UICollege }
