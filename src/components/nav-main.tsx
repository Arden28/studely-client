import { type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  // items?: { title: string; url: string }[] // no longer used (flat nav)
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon
          // Prefer provided isActive, else infer from pathname
          const active =
            item.isActive ??
            (item.url === "/"
              ? pathname === "/"
              : pathname === item.url || pathname.startsWith(item.url + "/"))

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title} data-active={active ? "true" : undefined}>
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
