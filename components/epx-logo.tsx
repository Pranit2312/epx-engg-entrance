import { cn } from "@/lib/utils"

type EpxLogoProps = {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { box: "h-8 w-8 text-xs", title: "text-sm", tagline: "text-[10px]" },
  md: { box: "h-10 w-10 text-sm", title: "text-sm", tagline: "text-[11px]" },
  lg: { box: "h-14 w-14 text-lg", title: "text-base", tagline: "text-xs" },
}

export function EpxLogo({ size = "md", showText = true, className }: EpxLogoProps) {
  const styles = sizeMap[size]

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 font-bold tracking-tight text-white shadow-lg shadow-violet-600/25",
          styles.box
        )}
      >
        <span className="relative z-10">EPX</span>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
      </div>
      {showText && (
        <div>
          <p className={cn("font-semibold leading-tight", styles.title)}>EPX</p>
          <p className={cn("text-muted-foreground", styles.tagline)}>Ace Your Exams</p>
        </div>
      )}
    </div>
  )
}
