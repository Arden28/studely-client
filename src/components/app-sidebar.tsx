"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  CheckSquare,
  BarChart3,
} from "lucide-react"

import useAuth from "@/hooks/useAuth"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { pathname } = useLocation()

  // Provide teams list for TeamSwitcher (keeps the same header design)
  const teams = React.useMemo(
    () => [{ name: "AssessPro", logo: LayoutDashboard, plan: "Standard" }],
    []
  )

  // Flat nav (no dropdown items). isActive computed from current path.
  const navMain = React.useMemo(
    () => [
      { title: "Dashboard",   url: "/",            icon: LayoutDashboard, isActive: pathname === "/" },
      { title: "Students",    url: "/students",            icon: Users,           isActive: pathname.startsWith("/students") },
      { title: "Modules",     url: "/modules",             icon: BookOpen,        isActive: pathname.startsWith("/modules") },
      { title: "Assessments", url: "/assessments",         icon: ClipboardList,   isActive: pathname.startsWith("/assessments") },
      { title: "Evaluate",    url: "/evaluate",            icon: CheckSquare,     isActive: pathname.startsWith("/evaluate") },
      { title: "Reports",     url: "/reports/overview",    icon: BarChart3,       isActive: pathname.startsWith("/reports") },
    ],
    [pathname]
  )

  const userForNav = {
    name: user?.name ?? "—",
    email: user?.email ?? "",
    avatar: "/avatars/shadcn.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      <SidebarContent>
        {/* NavMain should render plain links when items are omitted/empty */}
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
