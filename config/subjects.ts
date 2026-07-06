export const SUBJECTS = [
  "Physics",
  "Chemistry",
  "Mathematics",
] as const

export type Subject = (typeof SUBJECTS)[number]
