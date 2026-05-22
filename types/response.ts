export type FormResponseAnswer = {
  questionId: string
  value: string | number | string[]
}

export type FormResponse = {
  _id: string
  form: string
  email?: string | null
  answers: FormResponseAnswer[]
  createdAt: string
  updatedAt: string
}

export type FormResponsesPage = {
  responses: FormResponse[]
  page: number
  limit: number
  total: number
  totalPages: number
}
