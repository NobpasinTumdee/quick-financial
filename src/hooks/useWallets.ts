import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../context/AuthContext'

export interface Wallet {
  id: string
  user_id: string
  name: string
  balance: number
  icon_color: string
}

export function useWallets() {
  const { user } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWallets = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('Wallet')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    setWallets(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchWallets() }, [fetchWallets])

  const addWallet = async (name: string, balance: number, icon_color: string) => {
    if (!user) return
    const { error } = await supabase
      .from('Wallet')
      .insert({ user_id: user.id, name, balance, icon_color })
    if (!error) await fetchWallets()
    return { error }
  }

  const updateWallet = async (id: string, updates: Partial<Pick<Wallet, 'name' | 'balance' | 'icon_color'>>) => {
    const { error } = await supabase
      .from('Wallet')
      .update(updates)
      .eq('id', id)
    if (!error) await fetchWallets()
    return { error }
  }

  const deleteWallet = async (id: string) => {
    const { error } = await supabase
      .from('Wallet')
      .delete()
      .eq('id', id)
    if (!error) await fetchWallets()
    return { error }
  }

  const transferBetweenWallets = async (fromId: string, toId: string, amount: number) => {
    if (!user) return
    const fromWallet = wallets.find(w => w.id === fromId)
    const toWallet = wallets.find(w => w.id === toId)
    if (!fromWallet || !toWallet) return { error: new Error('Wallet not found') }
    if (fromWallet.balance < amount) return { error: new Error('Insufficient balance') }

    // Get or create TRANSFER category
    let { data: transferCat } = await supabase
      .from('Category')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'TRANSFER')
      .limit(1)
      .single()

    if (!transferCat) {
      const { data: newCat } = await supabase
        .from('Category')
        .insert({ user_id: user.id, name: 'Transfer', type: 'TRANSFER', icon_name: 'transfer', color: '#6C63FF' })
        .select('id')
        .single()
      transferCat = newCat
    }

    // Create transactions for both sides
    const now = new Date().toISOString().split('T')[0]
    await supabase.from('Transaction').insert([
      { wallet_id: fromId, category_id: transferCat!.id, type: 'TRANSFER', amount: -amount, transaction_date: now, note: `Transfer to ${toWallet.name}` },
      { wallet_id: toId, category_id: transferCat!.id, type: 'TRANSFER', amount: amount, transaction_date: now, note: `Transfer from ${fromWallet.name}` },
    ])

    // Update balances
    await supabase.from('Wallet').update({ balance: fromWallet.balance - amount }).eq('id', fromId)
    await supabase.from('Wallet').update({ balance: toWallet.balance + amount }).eq('id', toId)

    await fetchWallets()
    return { error: null }
  }

  const netWorth = wallets.reduce((sum, w) => sum + w.balance, 0)

  return { wallets, loading, netWorth, addWallet, updateWallet, deleteWallet, transferBetweenWallets, refetch: fetchWallets }
}
