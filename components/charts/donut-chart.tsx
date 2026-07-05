"use client"

import { memo } from "react"

export type DonutData = { name: string; value: number; color: string }
type Props = { subjects?: DonutData[] }

const defaultSubjects: DonutData[] = [
  { name: "Physics", value: 68, color: "#8b5cf6" },
  { name: "Chemistry", value: 74, color: "#22c55e" },
  { name: "Mathematics", value: 71, color: "#f97316" },
]

export const DonutChart = memo(function DonutChart({ subjects = defaultSubjects }: Props) {
  const size = 120
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = subjects.reduce((sum, s) => sum + s.value, 0)
  const overall = subjects.length > 0 ? Math.round(total / subjects.length) : 0

  let offset = 0

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          {subjects.map((subject) => {
            const segment = (subject.value / total) * circumference
            const dashArray = `${segment} ${circumference - segment}`
            const dashOffset = -offset
            offset += segment
            return (
              <circle
                key={subject.name}
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke={subject.color} strokeWidth={strokeWidth}
                strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{overall}%</span>
          <span className="text-[9px] text-muted-foreground">Overall</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {subjects.map((subject) => (
          <li key={subject.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
              <span className="text-[11px] text-muted-foreground">{subject.name}</span>
            </div>
            <span className="text-[11px] font-semibold">{subject.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
})
