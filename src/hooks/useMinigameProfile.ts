import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../context/AuthContext'

export interface MinigameProfile {
  user_id: string
  fire_points: number
  current_streak: number
  highest_streak: number
  current_level: number
  last_played_at: string | null
}

export function useMinigameProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<MinigameProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase
      .from('MinigameProfile')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // No profile yet — create one
      const { data: newProfile } = await supabase
        .from('MinigameProfile')
        .insert({ user_id: user.id })
        .select()
        .single()
      setProfile(newProfile)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const hasPlayedToday = useCallback((): boolean => {
    if (!profile?.last_played_at) return false
    const last = new Date(profile.last_played_at)
    const now = new Date()
    return (
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth() &&
      last.getDate() === now.getDate()
    )
  }, [profile])

  const recordWin = useCallback(async (pointsEarned: number) => {
    if (!user || !profile) return

    const now = new Date()
    const last = profile.last_played_at ? new Date(profile.last_played_at) : null

    // Check if played yesterday for streak
    let newStreak = 1
    if (last) {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const playedYesterday =
        last.getFullYear() === yesterday.getFullYear() &&
        last.getMonth() === yesterday.getMonth() &&
        last.getDate() === yesterday.getDate()

      // Also check if played today (continuing same day)
      const playedToday =
        last.getFullYear() === now.getFullYear() &&
        last.getMonth() === now.getMonth() &&
        last.getDate() === now.getDate()

      if (playedYesterday) {
        newStreak = profile.current_streak + 1
      } else if (playedToday) {
        newStreak = profile.current_streak // keep current streak
      }
    }

    const newHighest = Math.max(profile.highest_streak, newStreak)
    const newLevel = profile.current_level + 1
    const newPoints = profile.fire_points + pointsEarned

    const { error } = await supabase
      .from('MinigameProfile')
      .update({
        fire_points: newPoints,
        current_streak: newStreak,
        highest_streak: newHighest,
        current_level: newLevel,
        last_played_at: now.toISOString(),
      })
      .eq('user_id', user.id)

    if (!error) {
      setProfile(prev => prev ? {
        ...prev,
        fire_points: newPoints,
        current_streak: newStreak,
        highest_streak: newHighest,
        current_level: newLevel,
        last_played_at: now.toISOString(),
      } : prev)
    }
  }, [user, profile])

  return { profile, loading, hasPlayedToday, recordWin, refetch: fetchProfile }
}
