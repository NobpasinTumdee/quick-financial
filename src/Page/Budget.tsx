import { useState, useEffect } from 'react'
import AOS from 'aos'
import { useBudget } from '../hooks/useBudget'
import { useProfile } from '../hooks/useProfile'
import { useTransactions } from '../hooks/useTransactions'
import './Budget.css'

function formatMoney(n: number): string {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Budget() {
  const { currentBudget, budgetHistory, saveBudget } = useBudget()
  const { profile, updateProfile } = useProfile()
  const { getCurrentMonthByType } = useTransactions()

  const [needs, setNeeds] = useState(50)
  const [wants, setWants] = useState(30)
  const [savings, setSavings] = useState(20)
  const [salary, setSalary] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (currentBudget) {
      setNeeds(currentBudget.needs_percent)
      setWants(currentBudget.wants_percent)
      setSavings(currentBudget.savings_percent)
    }
  }, [currentBudget])

  useEffect(() => {
    if (profile) setSalary(String(profile.base_salary || ''))
  }, [profile])

  useEffect(() => { AOS.refresh() }, [budgetHistory])

  const handleSlider = (which: 'needs' | 'wants' | 'savings', value: number) => {
    let n = needs, w = wants, s = savings
    if (which === 'needs') n = value
    else if (which === 'wants') w = value
    else s = value

    const total = n + w + s
    if (total > 100) {
      const excess = total - 100
      if (which === 'needs') {
        // Reduce wants first, then savings
        const reduceW = Math.min(w, excess)
        w -= reduceW
        s -= (excess - reduceW)
      } else if (which === 'wants') {
        const reduceS = Math.min(s, excess)
        s -= reduceS
        n -= (excess - reduceS)
      } else {
        const reduceW = Math.min(w, excess)
        w -= reduceW
        n -= (excess - reduceW)
      }
    }

    setNeeds(Math.max(0, n))
    setWants(Math.max(0, w))
    setSavings(Math.max(0, s))
  }

  const handleSave = async () => {
    setSaving(true)
    if (salary && parseFloat(salary) !== (profile?.base_salary ?? 0)) {
      await updateProfile({ base_salary: parseFloat(salary) })
    }
    await saveBudget(needs, wants, savings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const salaryNum = parseFloat(salary) || 0
  const { income: monthIncome, expense: monthExpense } = getCurrentMonthByType()

  return (
    <div className="budget-page page-enter">
      <div className="page-header">
        <h1 data-aos="fade-right">Budget Planner</h1>
        <p data-aos="fade-right" data-aos-delay="50">Plan your monthly spending</p>
      </div>

      {/* Salary */}
      <div className="budget-salary glass-card" data-aos="fade-up">
        <div className="budget-salary-header">
          <h3>Monthly Base Salary</h3>
        </div>
        <div className="budget-salary-input">
          <span className="budget-currency">฿</span>
          <input
            className="input"
            type="number"
            step="100"
            placeholder="Enter base salary"
            value={salary}
            onChange={e => setSalary(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      {/* Sliders */}
      <div className="budget-sliders glass-card" data-aos="fade-up" data-aos-delay="100">
        <div className="budget-sliders-header">
          <h3>Allocation Plan</h3>
          <span className={`budget-total ${needs + wants + savings === 100 ? 'valid' : 'invalid'}`}>
            Total: {needs + wants + savings}%
          </span>
        </div>

        <div className="slider-group">
          <SliderRow
            label="Needs"
            description="Rent, food, bills, transport"
            value={needs}
            onChange={v => handleSlider('needs', v)}
            color="var(--warning)"
            amount={salaryNum * needs / 100}
          />
          <SliderRow
            label="Wants"
            description="Entertainment, dining, shopping"
            value={wants}
            onChange={v => handleSlider('wants', v)}
            color="var(--primary)"
            amount={salaryNum * wants / 100}
          />
          <SliderRow
            label="Savings"
            description="Emergency fund, investments"
            value={savings}
            onChange={v => handleSlider('savings', v)}
            color="var(--accent)"
            amount={salaryNum * savings / 100}
          />
        </div>

        {/* Visual bar */}
        <div className="budget-visual-bar">
          <div className="budget-bar-segment" style={{ width: `${needs}%`, background: 'var(--warning)' }}>
            {needs > 10 && <span>{needs}%</span>}
          </div>
          <div className="budget-bar-segment" style={{ width: `${wants}%`, background: 'var(--primary)' }}>
            {wants > 10 && <span>{wants}%</span>}
          </div>
          <div className="budget-bar-segment" style={{ width: `${savings}%`, background: 'var(--accent)' }}>
            {savings > 10 && <span>{savings}%</span>}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || needs + wants + savings !== 100}
          style={{ width: '100%', padding: 14, marginTop: 8 }}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Budget Plan'}
        </button>
      </div>

      {/* History */}
      <div className="budget-history glass-card" data-aos="fade-up" data-aos-delay="150">
        <h3>Budget History</h3>
        {budgetHistory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No budget history</p>
        ) : (
          <div className="history-table">
            <div className="history-header">
              <span>Month</span>
              <span>Needs</span>
              <span>Wants</span>
              <span>Savings</span>
            </div>
            {budgetHistory.map(b => (
              <div key={b.id} className="history-row">
                <span className="history-month">{MONTH_NAMES[b.month - 1]} {b.year}</span>
                <span>{b.needs_percent}%</span>
                <span>{b.wants_percent}%</span>
                <span>{b.savings_percent}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actual vs Plan */}
      <div className="budget-comparison glass-card" data-aos="fade-up" data-aos-delay="200">
        <h3>This Month: Plan vs Actual</h3>
        <div className="comparison-grid">
          <div className="comparison-item">
            <span className="comparison-label">Planned Income</span>
            <span className="comparison-value">฿{formatMoney(salaryNum)}</span>
          </div>
          <div className="comparison-item">
            <span className="comparison-label">Actual Income</span>
            <span className="comparison-value income">฿{formatMoney(monthIncome)}</span>
          </div>
          <div className="comparison-item">
            <span className="comparison-label">Planned Expense</span>
            <span className="comparison-value">฿{formatMoney(salaryNum * (needs + wants) / 100)}</span>
          </div>
          <div className="comparison-item">
            <span className="comparison-label">Actual Expense</span>
            <span className="comparison-value expense">฿{formatMoney(monthExpense)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SliderRow({ label, description, value, onChange, color, amount }: {
  label: string; description: string; value: number; onChange: (v: number) => void; color: string; amount: number
}) {
  return (
    <div className="slider-row">
      <div className="slider-info">
        <div className="slider-label-row">
          <span className="slider-dot" style={{ background: color }} />
          <span className="slider-label">{label}</span>
          <span className="slider-pct">{value}%</span>
        </div>
        <span className="slider-desc">{description}</span>
        <span className="slider-amount">฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="budget-slider"
        style={{ '--slider-color': color, '--slider-pct': `${value}%` } as React.CSSProperties}
      />
    </div>
  )
}
