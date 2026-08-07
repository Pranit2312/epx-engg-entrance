import test from "node:test"
import assert from "node:assert/strict"
import { buildMentorPrompt } from "./prompt-builder"

test("greeting prompts explicitly forbid report-style formatting", () => {
  const prompt = buildMentorPrompt({
    intent: "greeting",
    question: "hello",
    context: {
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
    shouldUseAnalytics: false,
  })

  assert.match(prompt, /Do not use headings, bullet points, emojis, or report-style sections/i)
  assert.match(prompt, /Reply in 1-3 short sentences/i)
})
