export const EXAMS = [
  { value: "JEE_MAIN", label: "JEE Main", shortLabel: "JEE" },
  { value: "JEE_ADVANCED", label: "JEE Advanced", shortLabel: "Adv" },
  { value: "MHT_CET", label: "MHT-CET", shortLabel: "CET" },
  { value: "BITSAT", label: "BITSAT", shortLabel: "BITS" },
  { value: "VITEEE", label: "VITEEE", shortLabel: "VIT" },
  { value: "COMEDK", label: "COMEDK", shortLabel: "COM" },
  { value: "KCET", label: "KCET", shortLabel: "KCET" },
  { value: "WBJEE", label: "WBJEE", shortLabel: "WBJ" },
  { value: "GUJCET", label: "GUJCET", shortLabel: "GUJ" },
  { value: "OTHER", label: "Other", shortLabel: "Other" },
] as const

export type ExamValue = (typeof EXAMS)[number]["value"]

export const EXAM_BY_VALUE = Object.fromEntries(EXAMS.map((e) => [e.value, e])) as Record<string, (typeof EXAMS)[number]>

export function getExamLabel(value: string): string {
  return EXAM_BY_VALUE[value]?.label ?? value
}

export function getExamShortLabel(value: string): string {
  return EXAM_BY_VALUE[value]?.shortLabel ?? value
}
