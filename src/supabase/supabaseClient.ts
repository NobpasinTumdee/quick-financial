import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const cookieStorage = {
  getItem(key: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
  },
  setItem(key: string, value: string): void {
    const d = new Date()
    d.setTime(d.getTime() + 365 * 86400000)
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`
  },
  removeItem(key: string): void {
    document.cookie = `${encodeURIComponent(key)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`
  },
}

export const supabase = createClient(String(supabaseUrl), String(supabaseKey), {
  auth: {
    storage: cookieStorage,
    storageKey: 'qf-auth',
    autoRefreshToken: true,
    persistSession: true,
  },
})
