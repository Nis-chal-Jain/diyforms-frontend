"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  fetchCurrentUser,
  googleLoginUser,
  loginUser,
  logoutUser,
  signUpUser,
} from "@/lib/api"
import { getAccessToken } from "@/lib/auth-storage"
import type { User } from "@/types/user"

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: {
    email?: string
    username?: string
    password: string
  }) => Promise<void>
  signup: (payload: {
    username: string
    email: string
    password: string
    name: string
  }) => Promise<void>
  googleLogin: (payload: { idToken: string }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const current = await fetchCurrentUser()
    setUser(current)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!getAccessToken()) {
        if (!cancelled) setIsLoading(false)
        return
      }

      try {
        const current = await fetchCurrentUser()
        if (!cancelled) setUser(current)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: Parameters<typeof loginUser>[0]) => {
    const loggedIn = await loginUser(payload)
    setUser(loggedIn)
  }, [])

  const signup = useCallback(
    async (payload: Parameters<typeof signUpUser>[0]) => {
      await signUpUser(payload)
    },
    []
  )

  const googleLogin = useCallback(
    async (payload: Parameters<typeof googleLoginUser>[0]) => {
      const loggedIn = await googleLoginUser(payload)
      setUser(loggedIn)
    },
    []
  )

  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      googleLogin,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, signup, googleLogin, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
