import React, { createContext, useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import auth, { isApiError, type Credentials } from "@/api/auth"
import apiService, { ApiError } from "@/api/apiService"

export type AppUser = {
  id: string | number
  name: string
  email: string
  phone?: string
  role?: string
  tenant_id?: number | null
  roles?: string[]
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

export interface AuthContextShape {
  status: AuthStatus
  user: AppUser | null
  isAuthenticated: boolean
  /** Accepts { email?, password, device? } to match Login usage */
  login: (payload: Pick<Credentials, "email" | "password"> & Partial<Pick<Credentials, "device">>) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setUser: React.Dispatch<React.SetStateAction<AppUser | null>>
}

export const AuthContext = createContext<AuthContextShape | undefined>(undefined)

function withTimeout<T>(p: Promise<T>, ms: number) {
  return Promise.race<T>([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("auth/me timeout")), ms)),
  ])
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>("unauthenticated")
  const navigate = useNavigate()

  // Bootstrap from token + cached user, then verify with /v1/user
  useEffect(() => {
    const token = apiService.getToken?.()
    const cached = auth.getUser<AppUser>()

    if (!token) {
      setUser(null)
      setStatus("unauthenticated")
      return
    }

    setUser(cached ?? null)
    setStatus("authenticated")

    ;(async () => {
      try {
        const me = await withTimeout(auth.fetchUser<AppUser>("/v1/user"), 3500)
        if (me) {
          setUser(me)
          setStatus("authenticated")
        }
      } catch (err) {
        if (isApiError(err) || (err instanceof ApiError && err.status === 401)) {
          apiService.removeToken()
          auth.setUser(null)
          setUser(null)
          setStatus("unauthenticated")
        } else {
          setStatus("authenticated") // network/timeout → keep cached session
        }
      }
    })()
  }, [])

  const login: AuthContextShape["login"] = useCallback(
    async ({ email, password, device = "web" }) => {
      setStatus("loading")
      try {
        await auth.login<AppUser>({ email, password, device }, "/v1/login")
        const me = await auth.fetchUser<AppUser>("/v1/user")
        setUser(me)
        setStatus("authenticated")
        navigate("/")
      } catch (err) {
        setUser(null)
        setStatus("unauthenticated")
        throw err // let the form show the API error
      }
    },
    [navigate]
  )

  const logout = useCallback(async () => {
    try {
      await auth.logout("/v1/logout")
    } catch {
      /* ignore */
    } finally {
      setUser(null)
      setStatus("unauthenticated")
      navigate("/auth/login")
    }
  }, [navigate])

  const refresh = useCallback(async () => {
    setStatus("loading")
    try {
      const me = await withTimeout(auth.fetchUser<AppUser>("/v1/user"), 3500)
      if (me) {
        setUser(me)
        setStatus("authenticated")
      } else {
        setStatus("authenticated")
      }
    } catch (err) {
      if (isApiError(err) || (err instanceof ApiError && err.status === 401)) {
        await auth.logout("/v1/logout")
        setUser(null)
        setStatus("unauthenticated")
      } else {
        setStatus("authenticated")
      }
    }
  }, [])

  const value = useMemo<AuthContextShape>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      refresh,
      setUser,
    }),
    [user, status, login, logout, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
