"use client"

import { memo } from "react"

type DataPoint = { day: string; value: number }
type Props = { data?: DataPoint[] }

const defaultData: DataPoint[] = [
  { day: "Mon", value: 58 },
  { day: "Tue", value: 62 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 68 },
  { day: "Fri", value: 65 },
  { day: "Sat", value: 70 },
  { day: "Sun", value: 72 },
]

export const PerformanceChart = memo(function PerformanceChart({ data = defaultData }: Props) {
  const width = 260
  const height = 100
  const padding = { top: 10, right: 10, bottom: 20, left: 10 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const maxVal = 100
  const minVal = 40

  const points = data.map((d, i) => {
    const x = padding.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2)
    const y = padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
  const peakPoint = points[points.length - 1]

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(139,92,246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(139,92,246)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={peakPoint.x} cy={peakPoint.y} r="4" fill="#a78bfa" stroke="#0a0b1e" strokeWidth="2" />
      </svg>
      <div
        className="absolute rounded-lg border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-violet-300"
        style={{ left: `${((peakPoint.x / width) * 100) - 8}%`, top: `${((peakPoint.y / height) * 100) - 18}%` }}
      >
        {peakPoint.value}%
      </div>
      <div className="mt-1 flex justify-between px-1">
        {data.map((d, i) => (
          <span key={`${d.day}-${i}`} className="text-[9px] text-muted-foreground">{d.day}</span>
        ))}
      </div>
    </div>
  )
})
