import { useState, useEffect } from 'react'
import AOS from 'aos'
import { useWallets } from '../hooks/useWallets'
import { useTransactions } from '../hooks/useTransactions'
import { useBudget } from '../hooks/useBudget'
import { useProfile } from '../hooks/useProfile'
import TransactionModal from '../components/TransactionModal'
import './Dashboard.css'

function calculateThaiTax(income: number): number {
  const taxableIncome = Math.max(0, income - 160000)
  const brackets = [
    { limit: 150000, rate: 0 },
    { limit: 300000, rate: 0.05 },
    { limit: 500000, rate: 0.10 },
    { limit: 750000, rate: 0.15 },
    { limit: 1000000, rate: 0.20 },
    { limit: 2000000, rate: 0.25 },
    { limit: 5000000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 },
  ]
  let remaining = taxableIncome
  let tax = 0
  let prev = 0
  for (const b of brackets) {
    const taxable = Math.min(remaining, b.limit - prev)
    if (taxable <= 0) break
    tax += taxable * b.rate
    remaining -= taxable
    prev = b.limit
  }
  return tax
}

function formatMoney(n: number): string {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Home() {
  const { wallets, netWorth } = useWallets()
  const { transactions, categories, getYTDIncome, getCurrentMonthByType, addTransaction, addCategory } = useTransactions()
  const { getBudgetForMonth, currentMonth, currentYear } = useBudget()
  const currentBudget = getBudgetForMonth(currentMonth, currentYear)
  const { profile } = useProfile()
  const [showModal, setShowModal] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  useEffect(() => { AOS.refresh() }, [transactions])

  const ytdIncome = getYTDIncome()
  const estimatedTax = calculateThaiTax(ytdIncome)
  const { income: monthIncome, expense: monthExpense } = getCurrentMonthByType()
  const salary = profile?.base_salary ?? 0

  // Budget progress
  const needsBudget = salary * (currentBudget?.needs_percent ?? 50) / 100
  const wantsBudget = salary * (currentBudget?.wants_percent ?? 30) / 100
  const savingsBudget = salary * (currentBudget?.savings_percent ?? 20) / 100
  const savedThisMonth = monthIncome - monthExpense

  return (
    <div className="dashboard page-enter">
      <div className="page-header">
        <h1 data-aos="fade-right">Dashboard</h1>
        <p data-aos="fade-right" data-aos-delay="50">Your financial overview</p>
      </div>

      {/* Net Worth Card */}
      <div className="net-worth-card glass-card" data-aos="fade-up">
        <div className="net-worth-label">Total Net Worth</div>
        <div className="net-worth-amount">฿{formatMoney(netWorth)}</div>
        <div className="net-worth-wallets">
          {wallets.map(w => (
            <div key={w.id} className="net-worth-wallet-item">
              <span className="wallet-dot" style={{ background: w.icon_color }} />
              <span>{w.name}</span>
              <span className="wallet-balance">฿{formatMoney(w.balance)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="dashboard-stats" data-aos="fade-up" data-aos-delay="100">
        <div className="stat-card glass-card">
          <div className="stat-label">Monthly Income</div>
          <div className="stat-value income">฿{formatMoney(monthIncome)}</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-label">Monthly Expense</div>
          <div className="stat-value expense">฿{formatMoney(monthExpense)}</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-label">Saved</div>
          <div className={`stat-value ${savedThisMonth >= 0 ? 'income' : 'expense'}`}>
            ฿{formatMoney(savedThisMonth)}
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="budget-progress glass-card" data-aos="fade-up" data-aos-delay="150">
        <h3>Budget Progress</h3>
        <p className="budget-subtitle">
          {currentBudget
            ? `${currentBudget.needs_percent}/${currentBudget.wants_percent}/${currentBudget.savings_percent} plan`
            : 'No budget set — using 50/30/20 default'}
        </p>

        <div className="progress-items">
          <ProgressBar label="Needs" spent={monthExpense * 0.6} budget={needsBudget} color="var(--warning)" />
          <ProgressBar label="Wants" spent={monthExpense * 0.4} budget={wantsBudget} color="var(--primary)" />
          <ProgressBar label="Savings" spent={savedThisMonth} budget={savingsBudget} color="var(--accent)" isSaving />
        </div>
      </div>

      {/* Tax Forecast */}
      <div className="tax-card glass-card" data-aos="fade-up" data-aos-delay="200">
        <h3>Tax Forecast</h3>
        <div className="tax-grid">
          <div className="tax-item">
            <span className="tax-label">YTD Income</span>
            <span className="tax-value">฿{formatMoney(ytdIncome)}</span>
          </div>
          <div className="tax-item">
            <span className="tax-label">Deductions</span>
            <span className="tax-value">-฿160,000</span>
          </div>
          <div className="tax-item">
            <span className="tax-label">Taxable Income</span>
            <span className="tax-value">฿{formatMoney(Math.max(0, ytdIncome - 160000))}</span>
          </div>
          <div className="tax-item highlight">
            <span className="tax-label">Estimated Tax</span>
            <span className="tax-value danger">฿{formatMoney(estimatedTax)}</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions glass-card" data-aos="fade-down" data-aos-delay="250">
        <h3>Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No transactions yet</p>
        ) : (
          <div className="tx-list">
            {transactions.slice(0, 8).map(tx => (
              <div key={tx.id} className="tx-item">
                <div className="tx-cat-dot" style={{ background: tx.category?.color ?? '#666' }} />
                <div className="tx-info">
                  <span className="tx-cat-name">{tx.category?.name ?? 'Unknown'}</span>
                  <span className="tx-note">{tx.note || tx.transaction_date}</span>
                </div>
                <span className={`tx-amount ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}฿{formatMoney(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fab-container">
        {fabOpen && (
          <div className="fab-menu" data-aos="fade-up">
            <button className="fab-option" onClick={() => { setFabOpen(false); setShowModal(true) }}>
              <span>Add Transaction</span>
            </button>
          </div>
        )}
        <button className={`fab-button ${fabOpen ? 'active' : ''}`} onClick={() => setFabOpen(!fabOpen)}>
          <span className="fab-icon">{fabOpen ? '×' : '+'}</span>
        </button>
      </div>

      {showModal && (
        <TransactionModal
          wallets={wallets}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSubmit={addTransaction}
          onAddCategory={addCategory}
        />
      )}
    </div>
  )
}

function ProgressBar({ label, spent, budget, color, isSaving }: {
  label: string; spent: number; budget: number; color: string; isSaving?: boolean
}) {
  const pct = budget > 0 ? Math.min(100, Math.max(0, (Math.abs(spent) / budget) * 100)) : 0
  const overBudget = !isSaving && spent > budget

  return (
    <div className="progress-item">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-values">
          ฿{formatMoney(Math.abs(spent))} / ฿{formatMoney(budget)}
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${overBudget ? 'over-budget' : ''}`}
          style={{ width: `${pct}%`, background: overBudget ? 'var(--danger)' : color }}
        />
      </div>
      <div className="progress-pct">{pct.toFixed(0)}%</div>
    </div>
  )
}
