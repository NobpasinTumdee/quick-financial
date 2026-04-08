import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './BudgetChart.css'

interface MonthData {
  label: string
  needs: number
  wants: number
  savings: number
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PAGE_SIZE = 6

function formatCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (abs >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toFixed(0)
}

export default function BudgetChart() {
  const { user } = useAuth()
  const [offset, setOffset] = useState(0)
  const [monthsData, setMonthsData] = useState<MonthData[]>([])
  const [loading, setLoading] = useState(true)
  const [animateKey, setAnimateKey] = useState(0)

  const getMonthRange = useCallback(() => {
    const now = new Date()
    const months: { year: number; month: number }[] = []
    for (let i = PAGE_SIZE - 1 + offset; i >= offset; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ year: d.getFullYear(), month: d.getMonth() })
    }
    return months
  }, [offset])

  const months = useMemo(() => getMonthRange(), [getMonthRange])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)

      const firstMonth = months[0]
      const lastMonth = months[months.length - 1]
      const startDate = `${firstMonth.year}-${String(firstMonth.month + 1).padStart(2, '0')}-01`
      const lastDay = new Date(lastMonth.year, lastMonth.month + 1, 0).getDate()
      const endDate = `${lastMonth.year}-${String(lastMonth.month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      const { data: txs } = await supabase
        .from('Transaction')
        .select('type, amount, transaction_date')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .in('type', ['INCOME', 'EXPENSE'])

      if (cancelled) return

      const result: MonthData[] = months.map(m => {
        const monthTxs = (txs ?? []).filter(tx => {
          const d = new Date(tx.transaction_date)
          return d.getMonth() === m.month && d.getFullYear() === m.year
        })

        const income = monthTxs
          .filter(t => t.type === 'INCOME')
          .reduce((s, t) => s + Math.abs(t.amount), 0)
        const expense = monthTxs
          .filter(t => t.type === 'EXPENSE')
          .reduce((s, t) => s + Math.abs(t.amount), 0)

        return {
          label: `${MONTH_NAMES[m.month]} ${String(m.year).slice(2)}`,
          needs: expense * 0.6,
          wants: expense * 0.4,
          savings: Math.max(0, income - expense),
        }
      })

      setMonthsData(result)
      setAnimateKey(prev => prev + 1)
      setLoading(false)
    }

    fetchData()
    return () => { cancelled = true }
  }, [user, months])

  const maxValue = useMemo(() => {
    if (monthsData.length === 0) return 1
    const allValues = monthsData.flatMap(m => [m.needs, m.wants, m.savings])
    return Math.max(...allValues, 1)
  }, [monthsData])

  const gridLines = useMemo(() => {
    const step = maxValue / 4
    return [0, 1, 2, 3, 4].map(i => Math.round(step * i))
  }, [maxValue])

  const canGoNewer = offset > 0

  const handlePrev = () => {
    setOffset(o => o + PAGE_SIZE)
  }

  const handleNext = () => {
    if (canGoNewer) setOffset(o => Math.max(0, o - PAGE_SIZE))
  }

  const rangeLabel = months.length > 0
    ? `${MONTH_NAMES[months[0].month]} ${months[0].year} — ${MONTH_NAMES[months[months.length - 1].month]} ${months[months.length - 1].year}`
    : ''

  return (
    <div className="budget-chart glass-card">
      <div className="budget-chart-header">
        <div>
          <h3>Budget Overview</h3>
          <p className="budget-chart-range">{rangeLabel}</p>
        </div>
        <div className="budget-chart-nav">
          <button className="btn btn-ghost budget-chart-btn" onClick={handlePrev} title="Older">
            &larr;
          </button>
          <button className="btn btn-ghost budget-chart-btn" onClick={handleNext} disabled={!canGoNewer} title="Newer">
            &rarr;
          </button>
        </div>
      </div>

      <div className="budget-chart-legend">
        <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--warning)' }} />Needs</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--primary)' }} />Wants</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent)' }} />Savings</span>
      </div>

      <div className="budget-chart-body">
        {/* Y-axis labels */}
        <div className="chart-y-axis">
          {gridLines.slice().reverse().map((val, i) => (
            <span key={i} className="chart-y-label">{formatCompact(val)}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="chart-area">
          {/* Grid lines */}
          <div className="chart-grid">
            {gridLines.map((_, i) => (
              <div key={i} className="chart-grid-line" />
            ))}
          </div>

          {/* Bars */}
          {loading ? (
            <div className="chart-loading">Loading...</div>
          ) : (
            <div className="chart-bars-container" key={animateKey}>
              {monthsData.map((m, i) => (
                <div key={i} className="chart-month-group">
                  <div className="chart-bars">
                    <ChartBar value={m.needs} max={maxValue} color="var(--warning)" label={`฿${formatCompact(m.needs)}`} delay={i * 60} />
                    <ChartBar value={m.wants} max={maxValue} color="var(--primary)" label={`฿${formatCompact(m.wants)}`} delay={i * 60 + 30} />
                    <ChartBar value={m.savings} max={maxValue} color="var(--accent)" label={`฿${formatCompact(m.savings)}`} delay={i * 60 + 60} />
                  </div>
                  <span className="chart-month-label">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChartBar({ value, max, color, label, delay }: {
  value: number; max: number; color: string; label: string; delay: number
}) {
  const [animated, setAnimated] = useState(false)
  const pct = max > 0 ? (value / max) * 100 : 0

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div className="chart-bar-wrapper">
      <div className="chart-bar-tooltip">{label}</div>
      <div className="chart-bar-track">
        <div
          className="chart-bar-fill"
          style={{
            height: animated ? `${pct}%` : '0%',
            background: color,
          }}
        />
      </div>
    </div>
  )
}
