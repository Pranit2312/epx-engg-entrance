import { NextResponse } from "next/server"
import { getTests } from "@/lib/data-service"
import { success } from "@/lib/api-response"

export async function GET() {
  try {
    const tests = await getTests()
    return success(tests)
  } catch (error) {
    console.error("Tests API error:", error)
    // Return empty array on error; data-service will provide fallback
    return success([])
  }
}
