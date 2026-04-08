import { useState, useEffect, type FormEvent } from 'react'
import AOS from 'aos'
import { useWallets, type Wallet } from '../hooks/useWallets'
import { useTransactions } from '../hooks/useTransactions'
import TransactionModal from '../components/TransactionModal'
import './Wallets.css'

function formatMoney(n: number): string {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const COLORS = [
  '#6C63FF', '#00D9A6', '#FF6B6B', '#FFB347', '#4ECB71', '#FF69B4', '#00BFFF', '#FF8C00',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#F97316',
  '#06B6D4', '#A855F7', '#84CC16', '#E11D48',
]

export default function Wallets() {
  const { wallets, netWorth, addWallet, deleteWallet, transferBetweenWallets, refetch: refetchWallets } = useWallets()
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [showAddWallet, setShowAddWallet] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showTxModal, setShowTxModal] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [catTab, setCatTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')

  // Add wallet form
  const [newName, setNewName] = useState('')
  const [newBalance, setNewBalance] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])

  // Transfer form
  const [fromWallet, setFromWallet] = useState('')
  const [toWallet, setToWallet] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferError, setTransferError] = useState('')

  const { transactions, categories, addTransaction, addCategory } = useTransactions(selectedWallet?.id)

  useEffect(() => { AOS.refresh() }, [wallets, transactions])

  const handleAddWallet = async (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    await addWallet(newName.trim(), parseFloat(newBalance) || 0, newColor)
    setNewName('')
    setNewBalance('')
    setShowAddWallet(false)
  }

  const handleTransfer = async (e: FormEvent) => {
    e.preventDefault()
    setTransferError('')
    if (fromWallet === toWallet) {
      setTransferError('Cannot transfer to the same wallet')
      return
    }
    const result = await transferBetweenWallets(fromWallet, toWallet, parseFloat(transferAmount))
    if (result?.error) {
      setTransferError(String(result.error instanceof Error ? result.error.message : result.error))
    } else {
      setTransferAmount('')
      setShowTransfer(false)
    }
  }

  return (
    <div className="wallets-page page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 data-aos="fade-right">Wallets</h1>
          <p data-aos="fade-right" data-aos-delay="50">Manage your wallets & transactions</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowCategories(true)}>Categories</button>
          <button className="btn btn-ghost" onClick={() => setShowTransfer(true)}>Transfer</button>
          <button className="btn btn-primary" onClick={() => setShowAddWallet(true)}>+ Add Wallet</button>
        </div>
      </div>

      {/* Total */}
      <div className="wallets-total glass-card" data-aos="fade-up">
        <span className="wallets-total-label">Total Balance</span>
        <span className="wallets-total-amount">฿{formatMoney(netWorth)}</span>
      </div>

      {/* Wallet Cards */}
      <div className="wallet-grid">
        {wallets.map((w, i) => (
          <div
            key={w.id}
            className={`wallet-card glass-card ${selectedWallet?.id === w.id ? 'selected' : ''}`}
            onClick={() => setSelectedWallet(selectedWallet?.id === w.id ? null : w)}
            data-aos="fade-up"
            data-aos-delay={i * 50}
          >
            <div className="wallet-card-top">
              <div className="wallet-card-icon" style={{ background: w.icon_color }}>
                {w.name.charAt(0).toUpperCase()}
              </div>
              <button
                className="wallet-delete-btn"
                onClick={e => { e.stopPropagation(); if (confirm(`Delete "${w.name}"?`)) deleteWallet(w.id) }}
                title="Delete"
              >
                &times;
              </button>
            </div>
            <div className="wallet-card-name">{w.name}</div>
            <div className="wallet-card-balance">฿{formatMoney(w.balance)}</div>
          </div>
        ))}
      </div>

      {/* Selected Wallet Transaction History */}
      {selectedWallet && (
        <div className="wallet-detail glass-card" data-aos="fade-up">
          <div className="wallet-detail-header">
            <h3>{selectedWallet.name} — Transactions</h3>
            <button className="btn btn-primary" onClick={() => setShowTxModal(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add
            </button>
          </div>

          {transactions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>No transactions in this wallet</p>
          ) : (
            <div className="tx-list">
              {transactions.map(tx => (
                <div key={tx.id} className="tx-item">
                  <div className="tx-cat-dot" style={{ background: tx.category?.color ?? '#666' }} />
                  <div className="tx-info">
                    <span className="tx-cat-name">{tx.category?.name ?? 'Unknown'}</span>
                    <span className="tx-note">{tx.note || tx.transaction_date}</span>
                  </div>
                  <span className={`tx-amount ${tx.type === 'INCOME' ? 'income' : tx.type === 'TRANSFER' ? '' : 'expense'}`}>
                    {tx.type === 'INCOME' ? '+' : tx.amount < 0 ? '' : '-'}฿{formatMoney(Math.abs(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddWallet && (
        <div className="modal-overlay" onClick={() => setShowAddWallet(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Add New Wallet</h2>
            <form onSubmit={handleAddWallet} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Name</label>
                <input className="input" placeholder="e.g. Savings Account" value={newName} onChange={e => setNewName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Initial Balance (฿)</label>
                <input className="input" type="number" step="0.01" placeholder="0.00" value={newBalance} onChange={e => setNewBalance(e.target.value)} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch ${newColor === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setNewColor(c)}
                    />
                  ))}
                  <label
                    className={`color-swatch ${!COLORS.includes(newColor) ? 'active' : ''}`}
                    style={{ background: newColor, position: 'relative', overflow: 'hidden' }}
                    title="Custom color"
                  >
                    <input
                      type="color"
                      value={newColor}
                      onChange={e => setNewColor(e.target.value)}
                      style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  </label>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14 }}>Create Wallet</button>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="modal-overlay" onClick={() => setShowTransfer(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Transfer Between Wallets</h2>
            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {transferError && <div className="login-error">{transferError}</div>}
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>From</label>
                <select className="input" value={fromWallet} onChange={e => setFromWallet(e.target.value)} required>
                  <option value="">Select wallet</option>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} (฿{formatMoney(w.balance)})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>To</label>
                <select className="input" value={toWallet} onChange={e => setToWallet(e.target.value)} required>
                  <option value="">Select wallet</option>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} (฿{formatMoney(w.balance)})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Amount (฿)</label>
                <input className="input" type="number" step="0.01" min="0.01" placeholder="0.00" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14 }}>Transfer</button>
            </form>
          </div>
        </div>
      )}

      {/* Categories Modal */}
      {showCategories && (
        <div className="modal-overlay" onClick={() => setShowCategories(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Categories</h2>
              <button onClick={() => setShowCategories(false)} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '1.1rem' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                className={`btn ${catTab === 'EXPENSE' ? 'btn-danger' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setCatTab('EXPENSE')}
              >
                Expense
              </button>
              <button
                className={`btn ${catTab === 'INCOME' ? 'btn-accent' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setCatTab('INCOME')}
              >
                Income
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '50vh', overflowY: 'auto' }}>
              {categories.filter(c => c.type === catTab).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
                  No {catTab.toLowerCase()} categories yet
                </p>
              ) : (
                categories.filter(c => c.type === catTab).map(cat => (
                  <div key={cat.id} className="cat-list-item glass-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '0.95rem' }}>{cat.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{cat.type}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction to Selected Wallet */}
      {showTxModal && selectedWallet && (
        <TransactionModal
          wallets={[selectedWallet]}
          categories={categories}
          onClose={() => { setShowTxModal(false); refetchWallets() }}
          onSubmit={addTransaction}
          onAddCategory={addCategory}
        />
      )}
    </div>
  )
}
