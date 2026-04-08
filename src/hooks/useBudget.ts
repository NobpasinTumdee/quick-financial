import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../context/AuthContext'

export interface BudgetPlan {
  id: string
  user_id: string
  month: number
  year: number
  needs_percent: number
  wants_percent: number
  savings_percent: number
}

export function useBudget() {
  const { user } = useAuth()
  const [currentBudget, setCurrentBudget] = useState<BudgetPlan | null>(null)
  const [budgetHistory, setBudgetHistory] = useState<BudgetPlan[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const fetchBudget = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Current month budget
    const { data: current } = await supabase
      .from('BudgetPlan')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single()

    setCurrentBudget(current)

    // Last 6 months history
    const { data: history } = await supabase
      .from('BudgetPlan')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(6)

    setBudgetHistory(history ?? [])
    setLoading(false)
  }, [user, currentMonth, currentYear])

  useEffect(() => { fetchBudget() }, [fetchBudget])

  const saveBudget = async (needs: number, wants: number, savings: number) => {
    if (!user) return

    const payload = {
      user_id: user.id,
      month: currentMonth,
      year: currentYear,
      needs_percent: needs,
      wants_percent: wants,
      savings_percent: savings,
    }

    if (currentBudget) {
      const { error } = await supabase
        .from('BudgetPlan')
        .update(payload)
        .eq('id', currentBudget.id)
      if (!error) await fetchBudget()
      return { error }
    } else {
      const { error } = await supabase
        .from('BudgetPlan')
        .insert(payload)
      if (!error) await fetchBudget()
      return { error }
    }
  }

  return { currentBudget, budgetHistory, loading, saveBudget, refetch: fetchBudget }
}
