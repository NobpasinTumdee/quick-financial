import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeName = 'dark' | 'light' | 'pink' | 'light-green' | 'dark-emerald' | 'midnight-blue' | 'sunset-orange' | 'purple-dream' | 'rose-pink' | 'cyberpunk' | 'coffee-brown' | 'ocean-teal' | 'mono-gray' | 'neon-blue' | 'forest' | 'gold-luxury' | 'ice-blue' | 'mint-fresh' | 'lavender-soft' | 'red-dark' | 'sky-light' | 'terminal-green' | 'sand-beige';

interface ThemeContextType {
  theme: ThemeName
  setTheme: (t: ThemeName) => void
  isSystem: boolean
  setUseSystem: (v: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, days = 365) {
  const d = new Date()
  d.setTime(d.getTime() + days * 86400000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`
}

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const savedTheme = getCookie('qf-theme') as ThemeName | null
  const savedSystem = getCookie('qf-theme-system')

  const [isSystem, setIsSystemState] = useState(savedSystem !== 'false')
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (savedSystem === 'false' && savedTheme) return savedTheme
    return getSystemTheme()
  })

  // Listen for system theme changes
  useEffect(() => {
    if (!isSystem) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setThemeState(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [isSystem])

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = (t: ThemeName) => {
    setThemeState(t)
    setCookie('qf-theme', t)
    setIsSystemState(false)
    setCookie('qf-theme-system', 'false')
  }

  const setUseSystem = (v: boolean) => {
    setIsSystemState(v)
    setCookie('qf-theme-system', String(v))
    if (v) {
      const sys = getSystemTheme()
      setThemeState(sys)
      setCookie('qf-theme', sys)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isSystem, setUseSystem }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
