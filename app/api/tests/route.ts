import { NextResponse } from "next/server"
import { getTests } from "@/lib/data-service"

export async function GET() {
  try {
    const tests = await getTests()
    return NextResponse.json(tests)
  } catch (error) {
    console.error("Tests API error:", error)
    // Return empty array on error; data-service will provide fallback
    return NextResponse.json([])
  }
}
