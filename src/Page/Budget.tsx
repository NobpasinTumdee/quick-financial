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

function buildMonthOptions(currentMonth: number, currentYear: number) {
  const options: { month: number; year: number; label: string }[] = []
  // 6 months back + current + 6 months forward
  for (let offset = -6; offset <= 6; offset++) {
    let m = currentMonth + offset
    let y = currentYear
    while (m < 1) { m += 12; y-- }
    while (m > 12) { m -= 12; y++ }
    options.push({ month: m, year: y, label: `${MONTH_NAMES[m - 1]} ${y}` })
  }
  return options
}

export default function Budget() {
  const {
    budgetHistory, currentMonth, currentYear,
    getBudgetForMonth, saveBudgetForMonth, deleteBudget, canDelete,
  } = useBudget()
  const { profile, updateProfile } = useProfile()
  const { getCurrentMonthByType } = useTransactions()

  // Target month for planning
  const [targetMonth, setTargetMonth] = useState(currentMonth)
  const [targetYear, setTargetYear] = useState(currentYear)

  const [needs, setNeeds] = useState(50)
  const [wants, setWants] = useState(30)
  const [savings, setSavings] = useState(20)
  const [salary, setSalary] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showAllPlans, setShowAllPlans] = useState(false)

  const monthOptions = buildMonthOptions(currentMonth, currentYear)

  // Load budget when target month changes
  useEffect(() => {
    const budget = getBudgetForMonth(targetMonth, targetYear)
    if (budget) {
      setNeeds(budget.needs_percent)
      setWants(budget.wants_percent)
      setSavings(budget.savings_percent)
    } else {
      setNeeds(50)
      setWants(30)
      setSavings(20)
    }
    setSaved(false)
  }, [targetMonth, targetYear, budgetHistory]) // eslint-disable-line react-hooks/exhaustive-deps

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

    setNeeds(Math.max(0, Math.round(n)))
    setWants(Math.max(0, Math.round(w)))
    setSavings(Math.max(0, Math.round(s)))
  }

  const handleInputChange = (which: 'needs' | 'wants' | 'savings', raw: string) => {
    const value = raw === '' ? 0 : parseInt(raw)
    if (isNaN(value) || value < 0) return

    const others = which === 'needs' ? wants + savings
      : which === 'wants' ? needs + savings
        : needs + wants
    const clamped = Math.min(value, 100 - 0) // allow typing but clamp on total

    if (clamped + others > 100) {
      // Clamp to max possible
      const maxAllowed = 100 - others
      if (which === 'needs') setNeeds(Math.max(0, maxAllowed))
      else if (which === 'wants') setWants(Math.max(0, maxAllowed))
      else setSavings(Math.max(0, maxAllowed))
    } else {
      if (which === 'needs') setNeeds(clamped)
      else if (which === 'wants') setWants(clamped)
      else setSavings(clamped)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    if (salary && parseFloat(salary) !== (profile?.base_salary ?? 0)) {
      await updateProfile({ base_salary: parseFloat(salary) })
    }
    await saveBudgetForMonth(targetMonth, targetYear, needs, wants, savings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget plan?')) {
      await deleteBudget(id)
    }
  }

  const handleMonthSelect = (value: string) => {
    const [m, y] = value.split('-').map(Number)
    setTargetMonth(m)
    setTargetYear(y)
  }

  const salaryNum = parseFloat(salary) || 0
  const { income: monthIncome, expense: monthExpense } = getCurrentMonthByType()
  const isCurrentMonth = targetMonth === currentMonth && targetYear === currentYear
  const existingBudget = getBudgetForMonth(targetMonth, targetYear)

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

      {/* Month Selector */}
      <div className="budget-month-selector glass-card" data-aos="fade-up" data-aos-delay="50">
        <h3>Planning for</h3>
        <select
          className="input month-select"
          value={`${targetMonth}-${targetYear}`}
          onChange={e => handleMonthSelect(e.target.value)}
        >
          {monthOptions.map(opt => (
            <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>
              {opt.label} {opt.month === currentMonth && opt.year === currentYear ? '(Current)' : ''}
            </option>
          ))}
        </select>
        {existingBudget && (
          <span className="month-has-plan">Has existing plan</span>
        )}
      </div>

      {/* Sliders + Inputs */}
      <div className="budget-sliders glass-card" data-aos="fade-up" data-aos-delay="100">
        <div className="budget-sliders-header">
          <h3>Allocation — {MONTH_NAMES[targetMonth - 1]} {targetYear}</h3>
          <span className={`budget-total ${needs + wants + savings === 100 ? 'valid' : 'invalid'}`}>
            Total: {needs + wants + savings}%
          </span>
        </div>

        <div className="slider-group">
          <SliderRow
            label="Needs"
            description="Rent, food, bills, transport"
            value={needs}
            onSlide={v => handleSlider('needs', v)}
            onInput={v => handleInputChange('needs', v)}
            color="var(--warning)"
            amount={salaryNum * needs / 100}
          />
          <SliderRow
            label="Wants"
            description="Entertainment, dining, shopping"
            value={wants}
            onSlide={v => handleSlider('wants', v)}
            onInput={v => handleInputChange('wants', v)}
            color="var(--primary)"
            amount={salaryNum * wants / 100}
          />
          <SliderRow
            label="Savings"
            description="Emergency fund, investments"
            value={savings}
            onSlide={v => handleSlider('savings', v)}
            onInput={v => handleInputChange('savings', v)}
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
          {saving ? 'Saving...' : saved ? 'Saved!' : existingBudget ? 'Update Budget Plan' : 'Save Budget Plan'}
        </button>
      </div>

      {/* History with progress bars */}
      <div className="budget-history glass-card" data-aos="fade-up" data-aos-delay="150">
        <h3>Budget History</h3>
        {budgetHistory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No budget history</p>
        ) : (
          <div className={`history-list ${showAllPlans ? 'expanded' : ''}`}>
            {budgetHistory.map(b => {
              const isFuture = b.year > currentYear || (b.year === currentYear && b.month > currentMonth)
              return (
                <div key={b.id} className={`history-card ${isFuture ? 'future' : ''}`}>
                  <div className="history-card-header">
                    <span className="history-month-label">
                      {MONTH_NAMES[b.month - 1]} {b.year}
                      {b.month === currentMonth && b.year === currentYear && (
                        <span className="history-badge current">Current</span>
                      )}
                      {isFuture && (
                        <span className="history-badge future-badge">Planned</span>
                      )}
                    </span>
                    {canDelete(b) && (
                      <button
                        className="history-delete-btn"
                        onClick={() => handleDelete(b.id)}
                        title="Delete plan"
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  {/* Progress bars */}
                  <div className="history-bars">
                    <div className="history-bar-row">
                      <span className="history-bar-label">Needs</span>
                      <div className="history-bar-track">
                        <div
                          className="history-bar-fill"
                          style={{ width: `${b.needs_percent}%`, background: 'var(--warning)' }}
                        />
                      </div>
                      <span className="history-bar-pct">{b.needs_percent}%</span>
                    </div>
                    <div className="history-bar-row">
                      <span className="history-bar-label">Wants</span>
                      <div className="history-bar-track">
                        <div
                          className="history-bar-fill"
                          style={{ width: `${b.wants_percent}%`, background: 'var(--primary)' }}
                        />
                      </div>
                      <span className="history-bar-pct">{b.wants_percent}%</span>
                    </div>
                    <div className="history-bar-row">
                      <span className="history-bar-label">Savings</span>
                      <div className="history-bar-track">
                        <div
                          className="history-bar-fill"
                          style={{ width: `${b.savings_percent}%`, background: 'var(--accent)' }}
                        />
                      </div>
                      <span className="history-bar-pct">{b.savings_percent}%</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {!showAllPlans && (
            <div className="history-list-overlay">
              <button 
                type="button" 
                className="history-expand-btn"
                onClick={() => setShowAllPlans(true)}
              >
                <span>Show more plans</span>
                <span style={{ fontSize: '0.75rem' }}>▼</span>
              </button>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Actual vs Plan - only show for current month */}
      {isCurrentMonth && (
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
      )}
    </div>
  )
}

function SliderRow({ label, description, value, onSlide, onInput, color, amount }: {
  label: string; description: string; value: number
  onSlide: (v: number) => void; onInput: (v: string) => void
  color: string; amount: number
}) {
  return (
    <div className="slider-row">
      <div className="slider-info">
        <div className="slider-label-row">
          <span className="slider-dot" style={{ background: color }} />
          <span className="slider-label">{label}</span>
          <div className="slider-input-group">
            <input
              type="number"
              className="slider-pct-input"
              value={value}
              min={0}
              max={100}
              onChange={e => onInput(e.target.value)}
              style={{ '--input-accent': color } as React.CSSProperties}
            />
            <span className="slider-pct-symbol">%</span>
          </div>
        </div>
        <span className="slider-desc">{description}</span>
        <span className="slider-amount">฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={e => onSlide(parseInt(e.target.value))}
        className="budget-slider"
        style={{ '--slider-color': color, '--slider-pct': `${value}%` } as React.CSSProperties}
      />
    </div>
  )
}
