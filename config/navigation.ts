export type NavItem = {
  label: string
  href: string
  icon: string
  badge?: string
}

export const SIDEBAR_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Mock Tests", href: "/tests", icon: "BookOpen" },
  { label: "Practice", href: "/practice", icon: "Brain" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Bookmarks", href: "/bookmarks", icon: "Bookmark" },
  { label: "Profile", href: "/profile", icon: "User" },
  { label: "Settings", href: "/settings", icon: "Settings" },
  { label: "Help", href: "/help", icon: "HelpCircle" },
]

export const QUICK_ACTIONS = [
  { label: "Daily Revision", href: "/practice", duration: 15, icon: "Flame" },
  { label: "Take a Test", href: "/tests", duration: 0, icon: "BookOpen" },
  { label: "View Analytics", href: "/analytics", duration: 0, icon: "BarChart3" },
]
