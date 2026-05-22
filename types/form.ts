export type FormSettings = {
  status: "draft" | "published" | "archived"
  restricted: boolean
}

export type QuestionOption = {
  label: string
  value: string
}

export type QuestionValidation = {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
}

export type QuestionType =
  | "text"
  | "textarea"
  | "number"
  | "radio"
  | "checkbox"
  | "select"

export type FormQuestion = {
  _id: string
  order: number
  type: QuestionType
  label: string
  description?: string
  placeholder?: string
  required: boolean
  options?: QuestionOption[]
  validation?: QuestionValidation
}

export type FormSummary = {
  _id: string
  formSlug: string
  title: string
  description?: string
  settings: FormSettings
  totalResponses: number
  createdAt: string
  updatedAt: string
}

export type FormDetail = FormSummary & {
  questions: FormQuestion[]
}

export type FormAnswerPayload = {
  questionId: string
  value: string | number | string[]
}

export type FormAccessState =
  | "loading"
  | "ready"
  | "not_found"
  | "login_required"
  | "access_denied"
  | "already_submitted"
