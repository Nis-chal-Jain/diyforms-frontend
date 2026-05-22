import { API_FORMS, API_RESPONSES, API_USERS } from "@/lib/config"
import type { FormResponsesPage } from "@/types/response"
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth-storage"
import type {
  FormAnswerPayload,
  FormDetail,
  FormQuestion,
  FormSummary,
} from "@/types/form"
import type { ApiErrorBody, ApiSuccess } from "@/types/user"
import type { User } from "@/types/user"

type RequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  retry?: boolean
  baseUrl?: string
}

export class ApiRequestError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "ApiRequestError"
    this.statusCode = statusCode
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) {
    const err = data as ApiErrorBody
    throw new ApiRequestError(
      err.message ?? "Request failed",
      res.status
    )
  }
  return data as T
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const res = await fetch(`${API_USERS}/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    const json = await parseJson<
      ApiSuccess<{ accessToken: string; refreshToken: string }>
    >(res)
    setTokens(json.data.accessToken, json.data.refreshToken)
    return true
  } catch {
    clearTokens()
    return false
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = false,
    retry = true,
    baseUrl = API_USERS,
  } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    credentials: "include",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth && retry) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retry: false })
    }
  }

  return parseJson<T>(res)
}

export async function fetchCurrentUser(): Promise<User> {
  const json = await apiRequest<ApiSuccess<{ user: User }>>("/user", {
    auth: true,
  })
  return json.data.user
}

export async function loginUser(payload: {
  email?: string
  username?: string
  password: string
}): Promise<User> {
  const json = await apiRequest<
    ApiSuccess<{ user: User; accessToken: string; refreshToken: string }>
  >("/login", { method: "POST", body: payload })

  setTokens(json.data.accessToken, json.data.refreshToken)
  return json.data.user
}

export async function signUpUser(payload: {
  username: string
  email: string
  password: string
  name: string
}): Promise<User> {
  const json = await apiRequest<ApiSuccess<{ user: User }>>("/signup", {
    method: "POST",
    body: payload,
  })
  return json.data.user
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest<ApiSuccess<Record<string, never>>>("/logout", {
      method: "POST",
      auth: true,
      retry: false,
    })
  } finally {
    clearTokens()
  }
}

export async function checkVerified(): Promise<boolean> {
  const json = await apiRequest<ApiSuccess<{ verified: boolean }>>(
    "/is-verified",
    { auth: true }
  )
  return json.data.verified
}

export async function sendEmailOtp(): Promise<void> {
  await apiRequest<ApiSuccess<unknown>>("/send-email-otp", {
    method: "POST",
    auth: true,
  })
}

export async function verifyEmailOtp(otp: string): Promise<void> {
  await apiRequest<ApiSuccess<Record<string, never>>>("/verify-email-otp", {
    method: "POST",
    auth: true,
    body: { otp },
  })
}

export async function fetchMyForms(): Promise<FormSummary[]> {
  const json = await apiRequest<ApiSuccess<{ forms: FormSummary[] }>>("/", {
    auth: true,
    baseUrl: API_FORMS,
  })
  return json.data.forms
}

export async function createForm(payload: {
  title: string
  description?: string
  questions: Array<Omit<FormQuestion, "_id">>
  settings?: Partial<FormSettings>
  userarr?: string[]
}): Promise<FormDetail> {
  const json = await apiRequest<ApiSuccess<FormDetail>>("/", {
    method: "POST",
    body: payload,
    auth: true,
    baseUrl: API_FORMS,
  })
  return json.data
}

export async function updateForm(
  slug: string,
  payload: {
    title?: string
    description?: string
    questions?: Array<Omit<FormQuestion, "_id">>
    settings?: Partial<FormSettings>
    userarr?: string[]
  }
): Promise<FormDetail> {
  const json = await apiRequest<ApiSuccess<FormDetail>>(`/${slug}`, {
    method: "POST",
    body: payload,
    auth: true,
    baseUrl: API_FORMS,
  })
  return json.data
}

export async function stopFormResponses(slug: string): Promise<void> {
  await apiRequest<ApiSuccess<unknown>>(`/${slug}/stop-response`, {
    method: "PATCH",
    auth: true,
    baseUrl: API_FORMS,
    retry: false,
  })
}

export async function resumeFormResponses(slug: string): Promise<void> {
  await apiRequest<ApiSuccess<unknown>>(`/${slug}/resume-response`, {
    method: "PATCH",
    auth: true,
    baseUrl: API_FORMS,
    retry: false,
  })
}

export async function deleteForm(slug: string): Promise<void> {
  await apiRequest<ApiSuccess<unknown>>(`/${slug}`, {
    method: "DELETE",
    auth: true,
    baseUrl: API_FORMS,
    retry: false,
  })
}

export async function fetchFormResponses(
  slug: string,
  page = 1,
  limit = 10
): Promise<FormResponsesPage> {
  const json = await apiRequest<ApiSuccess<FormResponsesPage>>(
    `/${slug}?page=${page}&limit=${limit}`,
    { auth: true, baseUrl: API_RESPONSES }
  )
  return json.data
}

function optionalAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) {
    const err = data as ApiErrorBody
    throw new ApiRequestError(
      err.message ?? "Request failed",
      res.status
    )
  }
  return data as T
}

export async function fetchFormBySlug(slug: string): Promise<FormDetail> {
  const res = await fetch(`${API_FORMS}/${slug}`, {
    credentials: "include",
    headers: optionalAuthHeaders(),
  })
  const json = await parseResponse<ApiSuccess<FormDetail>>(res)
  return json.data
}

export async function submitFormResponse(
  slug: string,
  answers: FormAnswerPayload[]
): Promise<void> {
  const res = await fetch(`${API_RESPONSES}/${slug}`, {
    method: "POST",
    credentials: "include",
    headers: optionalAuthHeaders(),
    body: JSON.stringify({ answers }),
  })
  await parseResponse<ApiSuccess<unknown>>(res)
}
