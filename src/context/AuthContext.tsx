import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../supabase/supabaseClient'

export interface SavedAccount {
  email: string
  user_id: string
  access_token: string
  refresh_token: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  savedAccounts: SavedAccount[]
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  switchAccount: (account: SavedAccount) => Promise<{ error: Error | null }>
  removeSavedAccount: (user_id: string) => void
}

const SAVED_ACCOUNTS_KEY = 'qf-saved-accounts'

function getSavedAccountsFromCookie(): SavedAccount[] {
  const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(SAVED_ACCOUNTS_KEY) + '=([^;]*)'))
  if (!match) return []
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return []
  }
}

function setSavedAccountsCookie(accounts: SavedAccount[]) {
  const d = new Date()
  d.setTime(d.getTime() + 365 * 86400000)
  document.cookie = `${encodeURIComponent(SAVED_ACCOUNTS_KEY)}=${encodeURIComponent(JSON.stringify(accounts))};expires=${d.toUTCString()};path=/;SameSite=Lax`
}

function saveAccountToCookie(session: Session) {
  const accounts = getSavedAccountsFromCookie()
  const email = session.user.email ?? ''
  const user_id = session.user.id
  const updated = accounts.filter(a => a.user_id !== user_id)
  updated.push({
    email,
    user_id,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })
  setSavedAccountsCookie(updated)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([])

  const refreshSavedAccounts = () => setSavedAccounts(getSavedAccountsFromCookie())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) saveAccountToCookie(session)
      refreshSavedAccounts()
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) saveAccountToCookie(session)
      refreshSavedAccounts()
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error as Error | null }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { error: error as Error | null }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error as Error | null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const switchAccount = async (account: SavedAccount) => {
    setLoading(true)
    const { error } = await supabase.auth.setSession({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    })
    if (error) {
      setLoading(false)
      // Token expired — remove stale account
      const accounts = getSavedAccountsFromCookie().filter(a => a.user_id !== account.user_id)
      setSavedAccountsCookie(accounts)
      refreshSavedAccounts()
    }
    return { error: error as Error | null }
  }

  const removeSavedAccount = (user_id: string) => {
    const accounts = getSavedAccountsFromCookie().filter(a => a.user_id !== user_id)
    setSavedAccountsCookie(accounts)
    refreshSavedAccounts()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, savedAccounts, signUp, signIn, signInWithGoogle, resetPassword, signOut, switchAccount, removeSavedAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
