import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Keep roles in one place so both sidebar and other components can reuse the type
export type Role = "SuperAdmin" | "CollegeAdmin" | "Evaluator" | "Student"

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  // roles?: Role[]   // handled/filtered in AppSidebar
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      {/* Optional label:
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      */}
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon
          const active =
            item.isActive ??
            (item.url === "/"
              ? pathname === "/"
              : pathname === item.url ||
                pathname.startsWith(item.url + "/"))

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                data-active={active ? "true" : undefined}
              >
                <Link to={item.url} aria-current={active ? "page" : undefined}>
                  {Icon ? <Icon /> : null}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
