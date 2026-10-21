import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { readVersionedStorage, removeStorageKey, writeVersionedStorage } from '../utils/storage.ts'
import {
  AUTH_EXPIRED_EVENT,
  setAuthToken,
  vibeApi,
  type LoginRequest,
  type RegisterRequest,
} from '../api/index.ts'
import type { CandidateCardDto } from '../types/vibe.ts'

const LS_AUTH_SESSION = 'vibematch.auth.session'
const DEFAULT_SESSION_TTL_MS = 12 * 60 * 60 * 1000

export interface AuthUser {
  id: number
  email: string
  displayName: string
  username: string
}

export interface AuthSession {
  user: AuthUser
  role: string
  token: string
  issuedAt: number
  expiresAt: number
}

interface AuthContextValue {
  isAuthenticated: boolean
  user: AuthUser | null
  myProfile: CandidateCardDto | null
  token: string | null
  login: (input: LoginRequest) => Promise<void>
  register: (input: RegisterRequest) => Promise<void>
  refreshProfile: () => Promise<void>
  setMyProfile: (profile: CandidateCardDto) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession(): AuthSession | null {
  const parsed = readVersionedStorage<AuthSession | null>(LS_AUTH_SESSION, {
    expectedVersion: 1,
    fallback: null,
  })
  if (parsed && parsed.token && parsed.expiresAt > Date.now()) {
    return parsed
  }
  removeStorageKey(LS_AUTH_SESSION)
  return null
}

function persistSession(session: AuthSession | null): void {
  if (!session) {
    removeStorageKey(LS_AUTH_SESSION)
    setAuthToken(null)
    return
  }
  writeVersionedStorage(LS_AUTH_SESSION, session, {
    version: 1,
    ttlMs: Math.max(0, session.expiresAt - Date.now()),
  })
  setAuthToken(session.token)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const restored = readStoredSession()
    if (restored) setAuthToken(restored.token)
    return restored
  })
  const [myProfile, setMyProfile] = useState<CandidateCardDto | null>(null)

  const refreshProfile = useCallback(async () => {
    if (!session?.token) return
    try {
      const profile = await vibeApi.getMyProfile()
      setMyProfile(profile)
    } catch {
      /* ignore transient fetch errors */
    }
  }, [session?.token])

  useEffect(() => {
    if (session?.token) {
      void refreshProfile()
    } else {
      setMyProfile(null)
    }
  }, [session?.token, refreshProfile])

  const login = useCallback(async (input: LoginRequest) => {
    const result = await vibeApi.login(input)
    const now = Date.now()
    const next: AuthSession = {
      user: {
        id: result.userId,
        email: input.email.trim().toLowerCase(),
        displayName: result.firstName || result.username,
        username: result.username,
      },
      role: result.role,
      token: result.token,
      issuedAt: now,
      expiresAt: now + DEFAULT_SESSION_TTL_MS,
    }
    persistSession(next)
    setSession(next)
  }, [])

  const register = useCallback(async (input: RegisterRequest) => {
    const result = await vibeApi.register(input)
    const now = Date.now()
    const next: AuthSession = {
      user: {
        id: result.userId,
        email: input.email.trim().toLowerCase(),
        displayName: result.firstName || result.username,
        username: result.username,
      },
      role: result.role,
      token: result.token,
      issuedAt: now,
      expiresAt: now + DEFAULT_SESSION_TTL_MS,
    }
    persistSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    persistSession(null)
    setSession(null)
    setMyProfile(null)
  }, [])

  useEffect(() => {
    const handler = () => logout()
    window.addEventListener(AUTH_EXPIRED_EVENT, handler)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler)
  }, [logout])

  const isAuthenticated = Boolean(session && session.expiresAt > Date.now())
  const user = isAuthenticated && session ? session.user : null
  const token = isAuthenticated && session ? session.token : null

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      myProfile,
      token,
      login,
      register,
      refreshProfile,
      setMyProfile,
      logout,
    }),
    [isAuthenticated, user, myProfile, token, login, register, refreshProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
