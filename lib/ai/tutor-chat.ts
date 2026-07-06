import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { BaseMessage, AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { Runnable } from "@langchain/core/runnables"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { prisma } from "@/lib/prisma"

export interface MentorContext {
  weakTopics: string[]
  strongSubjects: string[]
  targetExam: string
  recentScores: number[]
  totalTestsTaken: number
  averageAccuracy: number
}

const SYSTEM_TEMPLATE = `You are an expert AI mentor for Indian engineering entrance exam preparation (JEE Main, JEE Advanced, MHT-CET, BITSAT, COMEDK).

You have access to the student's performance data:
- Target Exam: {targetExam}
- Tests Taken: {totalTestsTaken}
- Average Accuracy: {averageAccuracy}%
- Recent Scores: [{recentScores}]
- Strong Subjects: [{strongSubjects}]
- Weak Topics: [{weakTopics}]

Be encouraging but honest. Provide specific, actionable advice. Use examples from actual exam problems when relevant.
Keep responses concise (2-3 paragraphs max). Never give generic advice — always reference the student's actual data.`

export class AIMentor {
  private chain: Runnable<any, string> | null = null
  private messages: BaseMessage[] = []
  private context: MentorContext

  constructor(context: MentorContext) {
    this.context = context
  }

  private async getChain(): Promise<Runnable<any, string>> {
    if (this.chain) return this.chain

    const apiKey = (typeof process !== "undefined" && process.env && process.env.GEMINI_API_KEY) || ""
    console.log("[TutorChat] GEMINI_API_KEY exists:", !!apiKey)
    console.log("[TutorChat] Key length:", apiKey?.length)
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured")

    const llm = new ChatGoogleGenerativeAI({
      apiKey,
      model: "gemini-2.0-flash",
      temperature: 0.7,
      maxRetries: 2,
    })

    const systemMessage = SYSTEM_TEMPLATE
      .replace("{targetExam}", this.context.targetExam)
      .replace("{totalTestsTaken}", String(this.context.totalTestsTaken))
      .replace("{averageAccuracy}", String(this.context.averageAccuracy))
      .replace("{recentScores}", this.context.recentScores.join(", "))
      .replace("{strongSubjects}", this.context.strongSubjects.join(", "))
      .replace("{weakTopics}", this.context.weakTopics.join(", "))

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemMessage],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ])

    this.chain = prompt.pipe(llm).pipe(new StringOutputParser())
    return this.chain
  }

  async chat(message: string, userId: string): Promise<string> {
    const chain = await this.getChain()

    await prisma.chatHistory.create({
      data: {
        userId,
        role: "user",
        content: message,
        context: this.context as any,
      },
    })

    const response = await chain.invoke({
      input: message,
      history: this.messages.slice(),
    })

    this.messages.push(new HumanMessage(message))
    this.messages.push(new AIMessage(response))

    if (this.messages.length > 20) {
      this.messages = this.messages.slice(-20)
    }

    await prisma.chatHistory.create({
      data: {
        userId,
        role: "assistant",
        content: response,
        context: this.context as any,
      },
    })

    return response
  }
}

export async function getChatHistory(userId: string, limit = 50) {
  return prisma.chatHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}
