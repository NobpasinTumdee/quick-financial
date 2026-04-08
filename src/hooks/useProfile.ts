import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../context/AuthContext'

export interface UserProfile {
  id: string
  base_salary: number
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('UserProfile')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(data)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'base_salary'>>) => {
    if (!user) return
    const { error } = await supabase
      .from('UserProfile')
      .upsert({ id: user.id, ...updates })
    if (!error) await fetchProfile()
    return { error }
  }

  return { profile, loading, updateProfile, refetch: fetchProfile }
}
