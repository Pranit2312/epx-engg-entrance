import type { Metadata } from "next"
import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)",
          color: "white",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "-0.5px",
        }}
      >
        EPX
      </div>
    ),
    { ...size }
  )
}
