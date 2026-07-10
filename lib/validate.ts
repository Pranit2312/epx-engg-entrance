export function required<T>(value: T | undefined | null, name: string): T {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    throw new ValidationError(`Missing required field: ${name}`)
  }
  return value
}

export function optionalString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) return value.trim()
  return undefined
}

export function optionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && !isNaN(value)) return value
  if (typeof value === "string") {
    const n = parseInt(value, 10)
    if (!isNaN(n)) return n
  }
  return undefined
}

export function asEnum<T extends Record<string, string>>(value: unknown, enumObj: T, defaultValue: T[keyof T]): T[keyof T] {
  if (typeof value === "string" && Object.values(enumObj).includes(value as T[keyof T])) {
    return value as T[keyof T]
  }
  return defaultValue
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}
