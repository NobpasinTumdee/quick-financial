import { useState, type FormEvent } from 'react'
import type { Wallet } from '../hooks/useWallets'
import type { Category } from '../hooks/useTransactions'

interface Props {
  wallets: Wallet[]
  categories: Category[]
  onClose: () => void
  onSubmit: (tx: {
    wallet_id: string
    category_id: string
    type: 'INCOME' | 'EXPENSE'
    amount: number
    transaction_date: string
    note: string
  }) => Promise<{ error: unknown }>
  onAddCategory: (cat: { name: string; type: 'INCOME' | 'EXPENSE' | 'TRANSFER'; icon_name: string; color: string }) => Promise<{ error: unknown; data: Category | null }>
}

export default function TransactionModal({ wallets, categories, onClose, onSubmit, onAddCategory }: Props) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // New category state
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#6C63FF')

  const filteredCats = categories.filter(c => c.type === type)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!walletId || !categoryId || !amount) {
      setError('Please fill all required fields')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await onSubmit({
      wallet_id: walletId,
      category_id: categoryId,
      type,
      amount: parseFloat(amount),
      transaction_date: date,
      note,
    })
    if (error) setError(String(error))
    else onClose()
    setLoading(false)
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    const { data } = await onAddCategory({
      name: newCatName.trim(),
      type,
      icon_name: 'tag',
      color: newCatColor,
    })
    if (data) {
      setCategoryId(data.id)
      setNewCatName('')
      setShowNewCat(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Add Transaction</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '1.1rem' }}>&times;</button>
        </div>

        {/* Type Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            className={`btn ${type === 'EXPENSE' ? 'btn-danger' : 'btn-ghost'}`}
            style={{ flex: 1 }}
            onClick={() => { setType('EXPENSE'); setCategoryId('') }}
          >
            Expense
          </button>
          <button
            className={`btn ${type === 'INCOME' ? 'btn-accent' : 'btn-ghost'}`}
            style={{ flex: 1 }}
            onClick={() => { setType('INCOME'); setCategoryId('') }}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Wallet</label>
            <select className="input" value={walletId} onChange={e => setWalletId(e.target.value)} required>
              <option value="">Select wallet</option>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Category</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)} required style={{ flex: 1 }}>
                <option value="">Select category</option>
                {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNewCat(!showNewCat)} style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>+ New</button>
            </div>
          </div>

          {showNewCat && (
            <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Name</label>
                <input className="input" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name" />
              </div>
              <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} style={{ width: 42, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }} />
              <button type="button" className="btn btn-primary" onClick={handleAddCategory} style={{ padding: '10px 16px' }}>Add</button>
            </div>
          )}

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Amount (฿)</label>
            <input className="input" type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Date</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Note</label>
            <input className="input" placeholder="Optional note..." value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: 14, marginTop: 4 }}>
            {loading ? 'Saving...' : `Add ${type === 'INCOME' ? 'Income' : 'Expense'}`}
          </button>
        </form>
      </div>
    </div>
  )
}
