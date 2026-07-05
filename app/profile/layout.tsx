import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | EPX",
  description: "Manage your EPX profile and academic preferences",
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
