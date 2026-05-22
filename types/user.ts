export type User = {
  _id: string
  username: string
  email: string
  name: string
  role: "user" | "admin"
  verified: boolean
  subscription?: {
    plan: "free" | "pro" | "enterprise"
    validTill?: string
    isActive: boolean
  }
  usage?: {
    formsCreated: number
    responsesCollected: number
  }
  createdAt?: string
  updatedAt?: string
}

export type ApiSuccess<T> = {
  statusCode: number
  data: T
  message: string
  success: boolean
}

export type ApiErrorBody = {
  success: false
  message: string
  errors?: unknown[]
}
