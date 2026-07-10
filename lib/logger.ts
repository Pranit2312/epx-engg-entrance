type LogCategory = "AUTH" | "API" | "DB" | "AI" | "ANALYTICS" | "TESTS" | "SYSTEM"

interface LogEntry {
  id: string
  category: LogCategory
  userId?: string
  message: string
  timestamp: string
  durationMs?: number
  error?: string
  metadata?: Record<string, unknown>
}

const isDev = process.env.NODE_ENV === "development"

function generateId(): string {
  return crypto.randomUUID?.()?.slice(0, 8) ?? Date.now().toString(36)
}

function formatLog(entry: LogEntry): string {
  const parts = [
    `[${entry.category}]`,
    entry.userId ? `[user=${entry.userId}]` : "",
    entry.durationMs ? `[${entry.durationMs}ms]` : "",
  ]
  return `${parts.filter(Boolean).join(" ")} ${entry.message}`
}

export function log(
  category: LogCategory,
  message: string,
  options?: { userId?: string; durationMs?: number; error?: Error; metadata?: Record<string, unknown> }
): void {
  const entry: LogEntry = {
    id: generateId(),
    category,
    message,
    timestamp: new Date().toISOString(),
    userId: options?.userId,
    durationMs: options?.durationMs,
    error: options?.error?.message,
    metadata: options?.metadata,
  }

  if (isDev) {
    if (options?.error) {
      console.error(formatLog(entry), options.error)
    } else {
      console.log(formatLog(entry))
    }
  }
}

export function createRequestLogger(category: LogCategory, userId?: string) {
  const start = Date.now()
  const id = generateId()
  const requestUserId = userId

  return {
    id,
    info: (message: string) => log(category, message, { userId: requestUserId }),
    done: (message: string) => log(category, message, { userId: requestUserId, durationMs: Date.now() - start }),
    error: (message: string, err: Error) =>
      log(category, message, { userId: requestUserId, durationMs: Date.now() - start, error: err }),
  }
}
