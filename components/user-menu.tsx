"use client"

import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import {
  UserCircle,
  Settings,
  Shield,
  Palette,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type UserMenuProps = {
  variant?: "header" | "navbar"
  className?: string
}

export function UserMenu({ variant = "header", className }: UserMenuProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { setTheme, theme } = useTheme()

  const userName = session?.user?.name || "Student"
  const userEmail = session?.user?.email || ""
  const userImage = session?.user?.image
  const initial = userName.charAt(0).toUpperCase()

  if (!session) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-border bg-muted px-2.5 py-1.5 outline-none transition-all hover:border-border hover:bg-muted/50 data-popup-open:border-violet-500/30 data-popup-open:bg-muted/50",
          variant === "navbar" && "px-3",
          className
        )}
      >
        <Avatar size="sm" className="size-8">
          {userImage ? <AvatarImage src={userImage} alt={userName} /> : null}
          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-xs font-bold text-white">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left sm:block">
          <p className="max-w-[120px] truncate text-sm font-medium leading-tight">{userName}</p>
          <p className="text-[10px] text-muted-foreground">Student</p>
        </div>
        <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-xl border border-border bg-popover/95 p-1.5 shadow-2xl backdrop-blur-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-2">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">{userEmail}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-muted" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl px-2 py-2"
            onClick={() => router.push("/profile")}
          >
            <UserCircle className="h-4 w-4" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl px-2 py-2"
            onClick={() => router.push("/settings")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl px-2 py-2"
            onClick={() => router.push("/settings#account")}
          >
            <Shield className="h-4 w-4" />
            Account
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer rounded-xl px-2 py-2">
              <Palette className="h-4 w-4" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="rounded-xl border border-border bg-popover/95 p-1 backdrop-blur-xl">
              <DropdownMenuItem className="cursor-pointer rounded-xl" onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4" />
                Light
                {theme === "light" && <span className="ml-auto text-xs text-violet-400">Active</span>}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-xl" onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4" />
                Dark
                {theme === "dark" && <span className="ml-auto text-xs text-violet-400">Active</span>}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-xl" onClick={() => setTheme("system")}>
                <Monitor className="h-4 w-4" />
                System
                {theme === "system" && <span className="ml-auto text-xs text-violet-400">Active</span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-muted" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer rounded-xl px-2 py-2"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
