import { useState } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../context/AuthContext'

interface ExportModalProps {
  onClose: () => void
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const { user } = useAuth()
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [fromMonth, setFromMonth] = useState(currentMonth)
  const [toMonth, setToMonth] = useState(currentMonth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleExport = async () => {
    if (fromMonth > toMonth) {
      setError('เดือนเริ่มต้นต้องไม่มากกว่าเดือนสิ้นสุด')
      return
    }

    setError('')
    setLoading(true)

    try {
      const startDate = `${fromMonth}-01`
      const [toYear, toMon] = toMonth.split('-').map(Number)
      const lastDay = new Date(toYear, toMon, 0).getDate()
      const endDate = `${toMonth}-${String(lastDay).padStart(2, '0')}`

      // Get user's wallet IDs to filter transactions by current user only
      const { data: userWallets } = await supabase
        .from('Wallet')
        .select('id')
        .eq('user_id', user!.id)

      const walletIds = (userWallets ?? []).map(w => w.id)

      if (walletIds.length === 0) {
        setError('ไม่พบข้อมูลในช่วงเวลาที่เลือก')
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('Transaction')
        .select('*, category:Category(name), wallet:Wallet(name)')
        .in('wallet_id', walletIds)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: true })

      if (fetchError) {
        setError('ไม่สามารถดึงข้อมูลได้: ' + fetchError.message)
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setError('ไม่พบข้อมูลในช่วงเวลาที่เลือก')
        setLoading(false)
        return
      }

      const headers = ['Date', 'Type', 'Category', 'Wallet', 'Amount', 'Note']
      const rows = data.map(tx => [
        tx.transaction_date,
        tx.type,
        tx.category?.name ?? '',
        tx.wallet?.name ?? '',
        tx.type === 'EXPENSE' ? `-${Math.abs(tx.amount)}` : String(Math.abs(tx.amount)),
        `"${(tx.note || '').replace(/"/g, '""')}"`,
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const bom = '\uFEFF'
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transactions_${fromMonth}_to_${toMonth}.csv`
      link.click()
      URL.revokeObjectURL(url)

      onClose()
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Export Transactions</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>From</label>
            <input
              className="input"
              type="month"
              value={fromMonth}
              onChange={e => setFromMonth(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>To</label>
            <input
              className="input"
              type="month"
              value={toMonth}
              onChange={e => setToMonth(e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleExport}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
