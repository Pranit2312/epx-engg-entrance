export const SUBJECTS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
] as const

export type Subject = (typeof SUBJECTS)[number]
