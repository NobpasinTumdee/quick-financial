import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../context/AuthContext'

export interface Transaction {
  id: string
  wallet_id: string
  category_id: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  amount: number
  transaction_date: string
  note: string
  category?: { name: string; color: string; icon_name: string }
  wallet?: { name: string }
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  icon_name: string
  color: string
}

export function useTransactions(walletId?: string) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Get user's wallet IDs to filter transactions by current user only
    const { data: userWallets } = await supabase
      .from('Wallet')
      .select('id')
      .eq('user_id', user.id)

    const walletIds = (userWallets ?? []).map(w => w.id)

    if (walletIds.length === 0) {
      setTransactions([])
      setLoading(false)
      return
    }

    let query = supabase
      .from('Transaction')
      .select('*, category:Category(name, color, icon_name), wallet:Wallet(name)')
      .in('wallet_id', walletIds)
      .order('transaction_date', { ascending: false })

    if (walletId) {
      query = query.eq('wallet_id', walletId)
    }

    const { data } = await query
    setTransactions(data ?? [])
    setLoading(false)
  }, [user, walletId])

  const fetchCategories = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('Category')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    setCategories(data ?? [])
  }, [user])

  useEffect(() => { fetchTransactions(); fetchCategories() }, [fetchTransactions, fetchCategories])

  const addTransaction = async (tx: {
    wallet_id: string
    category_id: string
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    amount: number
    transaction_date: string
    note: string
  }) => {
    const { error } = await supabase.from('Transaction').insert(tx)
    if (!error) {
      // Update wallet balance
      const delta = tx.type === 'INCOME' ? tx.amount : -tx.amount
      const { data: wallet } = await supabase.from('Wallet').select('balance').eq('id', tx.wallet_id).single()
      if (wallet) {
        await supabase.from('Wallet').update({ balance: wallet.balance + delta }).eq('id', tx.wallet_id)
      }
      await fetchTransactions()
    }
    return { error }
  }

  const addCategory = async (cat: { name: string; type: 'INCOME' | 'EXPENSE' | 'TRANSFER'; icon_name: string; color: string }) => {
    if (!user) return { error: new Error('No user'), data: null }
    const { data, error } = await supabase
      .from('Category')
      .insert({ ...cat, user_id: user.id })
      .select()
      .single()
    if (!error) await fetchCategories()
    return { error, data }
  }

  // Get YTD income for tax calculation
  const getYTDIncome = useCallback(() => {
    const currentYear = new Date().getFullYear()
    return transactions
      .filter(t => t.type === 'INCOME' && new Date(t.transaction_date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }, [transactions])

  // Get current month transactions by type
  const getCurrentMonthByType = useCallback(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthTxs = transactions.filter(t => {
      const d = new Date(t.transaction_date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    return {
      income: monthTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Math.abs(t.amount), 0),
      expense: monthTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Math.abs(t.amount), 0),
    }
  }, [transactions])

  return {
    transactions, categories, loading,
    addTransaction, addCategory,
    getYTDIncome, getCurrentMonthByType,
    refetch: fetchTransactions,
  }
}
