import * as React from "react"

export function FieldRow({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex gap-4 ${className ?? ""}`}>{children}</div>
}