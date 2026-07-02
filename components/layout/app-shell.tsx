"use client"

import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { RightPanel } from "./right-panel"
import { cn } from "@/lib/utils"

type AppShellProps = {
  children: React.ReactNode
  showRightPanel?: boolean
}

export function AppShell({ children, showRightPanel = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#060714]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-10%] left-[20%] h-[40%] w-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[35%] w-[35%] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      <AppSidebar />

      <div
        className={cn(
          "relative flex min-h-screen flex-col pl-0 transition-all lg:pl-[240px]",
          showRightPanel && "xl:pr-[300px]"
        )}
      >
        <AppHeader />
        <main className="flex-1 p-4 sm:p-5">{children}</main>
      </div>

      {showRightPanel && (
        <div className="hidden xl:block">
          <RightPanel />
        </div>
      )}
    </div>
  )
}
