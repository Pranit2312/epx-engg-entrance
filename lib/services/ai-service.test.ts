import test from "node:test"
import assert from "node:assert/strict"
import { generateMentorResponse } from "./ai-service"

test("generateMentorResponse uses the intent-aware prompt for greetings", async () => {
  process.env.GROQ_API_KEY = "test-key"

  const response = await generateMentorResponse(
    "hello there",
    {
      targetExam: "JEE_MAIN",
      name: "Aarav",
      subjectAccuracy: [],
      chapterAccuracy: [],
      weakTopics: [],
      strongTopics: [],
      recentAttempts: 0,
      averageScore: 0,
      recentScores: [],
      percentiles: [],
      timeSpentPerSubject: [],
      latestPercentile: null,
      latestRank: null,
      historyContext: "",
    },
    async (prompt: string, systemPrompt?: string) => {
      assert.match(prompt, /not as a rigid report generator/i)
      assert.match(prompt, /Student message: hello there/i)
      assert.match(systemPrompt ?? "", /supportive AI study mentor/i)
      return "friendly reply"
    }
  )

  assert.equal(response, "friendly reply")
})
