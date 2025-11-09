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
import type { UIStudent } from "@/api/student"

// --- UPDATED: pass user as a parameter instead of using hook inside ---
export function buildStudentColumns(
  onEdit: (s: UIStudent) => void,
  onDelete: (s: UIStudent) => void,
  user?: { role?: string }
): ColumnDef<UIStudent, unknown>[] {

  const cols: ColumnDef<UIStudent, unknown>[] = [
    {
      id: "regNo",
      header: "Reg No.",
      accessorKey: "regNo",
      cell: ({ getValue }) => <span className="font-mono">{String(getValue() ?? "—")}</span>,
      size: 110,
    },
    {
      id: "name",
      header: "Full Name",
      accessorFn: (row) => row.userName ?? "—",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.userName ?? "—"}</span>
        </div>
      ),
      sortingFn: "alphanumeric",
    },
    {
      id: "universityName",
      header: "University Name",
      accessorKey: "universityName",
      cell: ({ getValue }) => <span>{(getValue() as string) || "—"}</span>,
      enableGrouping: true,
    },
    {
      id: "userEmail",
      header: "Email",
      accessorKey: "userEmail",
      cell: ({ getValue }) => <span className="text-muted-foreground">{(getValue() as string) || "—"}</span>,
    },
    {
      id: "gender",
      header: "Gender",
      accessorKey: "gender",
      cell: ({ getValue }) => <span>{(getValue() as string) || "—"}</span>,
      enableHiding: true,
      size: 90,
    },
    {
      id: "dob",
      header: "Date of Birth",
      accessorKey: "dob",
      cell: ({ getValue }) => {
        const v = getValue() as string | undefined
        if (!v) return "—"
        return v.slice(0, 10)
      },
      enableHiding: true,
      size: 120,
    },
    {
      id: "admissionYear",
      header: "Year of Admission",
      accessorKey: "admissionYear",
      cell: ({ getValue }) => <span>{String(getValue() ?? "—")}</span>,
      enableHiding: true,
      size: 140,
    },
    {
      id: "currentSemester",
      header: "Current Semester",
      accessorKey: "currentSemester",
      cell: ({ getValue }) => <span>{String(getValue() ?? "—")}</span>,
      enableHiding: true,
      size: 140,
    },
    {
      id: "createdAt",
      header: "Joined On",
      accessorKey: "createdAt",
      cell: ({ getValue }) => {
        const v = getValue() as string | undefined
        if (!v) return "—"
        return v.slice(0, 10)
      },
      enableHiding: true,
      size: 110,
    },
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const s = row.original

        if (user?.role !== "SuperAdmin") return null;

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

export type { UIStudent }
