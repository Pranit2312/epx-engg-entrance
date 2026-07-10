import { Loader2 } from "lucide-react"

export function LoadingPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
    </div>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" }
  return <Loader2 className={`animate-spin text-violet-400 ${sizeMap[size]}`} />
}
