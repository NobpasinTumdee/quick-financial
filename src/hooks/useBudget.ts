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
  const [budgetHistory, setBudgetHistory] = useState<BudgetPlan[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const fetchBudget = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data: history } = await supabase
      .from('BudgetPlan')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(12)

    setBudgetHistory(history ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchBudget() }, [fetchBudget])

  const getBudgetForMonth = (month: number, year: number) => {
    return budgetHistory.find(b => b.month === month && b.year === year) ?? null
  }

  const saveBudgetForMonth = async (month: number, year: number, needs: number, wants: number, savings: number) => {
    if (!user) return

    const existing = getBudgetForMonth(month, year)
    const payload = {
      user_id: user.id,
      month,
      year,
      needs_percent: needs,
      wants_percent: wants,
      savings_percent: savings,
    }

    if (existing) {
      const { error } = await supabase
        .from('BudgetPlan')
        .update(payload)
        .eq('id', existing.id)
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

  const deleteBudget = async (id: string) => {
    const { error } = await supabase
      .from('BudgetPlan')
      .delete()
      .eq('id', id)
    if (!error) await fetchBudget()
    return { error }
  }

  const canDelete = (b: BudgetPlan) => {
    // Can only delete current month or future
    if (b.year > currentYear) return true
    if (b.year === currentYear && b.month >= currentMonth) return true
    return false
  }

  return {
    budgetHistory, loading,
    currentMonth, currentYear,
    getBudgetForMonth, saveBudgetForMonth, deleteBudget, canDelete,
    refetch: fetchBudget,
  }
}
