import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | EPX",
  description: "Customize your EPX experience",
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
