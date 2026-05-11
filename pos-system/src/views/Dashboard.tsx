import { useMemo } from 'react'
import type { Product, Transaction, Expense } from '../types'

interface Props {
  products: Product[]
  transactions: Transaction[]
  expenses: Expense[]
}

const ph = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 })

function pastDateStr(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString()
}

function shortDay(dateStr: string): string {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '?' : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()]
}

export default function Dashboard({ products, transactions, expenses }: Props) {
  const todayStr = new Date().toLocaleDateString()

  // ── Today-only KPIs ───────────────────────────────────────────────────────
  const todayTxns = transactions.filter(t => t.date === todayStr)
  const todayRev   = todayTxns.reduce((s, t) => s + t.total, 0)
  const todayCOGS  = todayTxns.reduce((s, t) => s + (t.cogs || 0), 0)
  const todayItems = todayTxns.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0)
  const totalExp   = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit  = todayRev - todayCOGS - totalExp
  const margin     = todayRev > 0 ? Math.round(netProfit / todayRev * 100) : 0
  const lowCount   = products.filter(p => p.stock <= p.lowStock).length
  const invVal     = products.reduce((s, p) => s + p.stock * p.cost, 0)
  const avgVal     = todayTxns.length ? Math.round(todayRev / todayTxns.length) : 0

  // ── Last 7 days real data for bar chart ───────────────────────────────────
  const chartDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dateStr = pastDateStr(6 - i)
      const dayTxns = transactions.filter(t => t.date === dateStr)
      return {
        label:   shortDay(dateStr),
        rev:     dayTxns.reduce((s, t) => s + t.total, 0),
        isToday: i === 6,
      }
    })
  }, [transactions])

  const maxBar    = Math.max(...chartDays.map(d => d.rev), 1)
  const weekTotal = chartDays.reduce((a, d) => a + d.rev, 0)

  // ── Top products from real transaction data ───────────────────────────────
  const topProducts = useMemo(() => {
    const acc: Record<number, { name: string; qty: number; rev: number }> = {}
    transactions.forEach(t => t.items.forEach(i => {
      if (!acc[i.id]) acc[i.id] = { name: i.name, qty: 0, rev: 0 }
      acc[i.id].qty += i.qty
      acc[i.id].rev += i.price * i.qty
    }))
    return Object.values(acc).sort((a, b) => b.rev - a.rev).slice(0, 5)
  }, [transactions])

  // ── Receivables (unpaid credit sales) ────────────────────────────────────
  const receivables = transactions.filter(t => t.payment === 'credit' && !t.paid).reduce((s, t) => s + t.total, 0)

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Revenue <i className="ti ti-cash" style={{ color: 'var(--green)' }} /></div>
          <div className="stat-value">{ph(todayRev)}</div>
          <div className="stat-sub"><span className="up">{todayTxns.length} transaction{todayTxns.length !== 1 ? 's' : ''}</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cost of Goods Sold <i className="ti ti-receipt" style={{ color: 'var(--red)' }} /></div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{ph(todayCOGS)}</div>
          <div className="stat-sub"><span>{todayItems}</span> items sold</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Expenses <i className="ti ti-file-invoice" style={{ color: 'var(--amber)' }} /></div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{ph(totalExp)}</div>
          <div className="stat-sub"><span>{expenses.length}</span> expense entries</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(34,201,123,0.25)', background: 'rgba(34,201,123,0.05)' }}>
          <div className="stat-label">Net Profit <i className="ti ti-trending-up" style={{ color: 'var(--green)' }} /></div>
          <div className="stat-value" style={{ color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>{ph(netProfit)}</div>
          <div className="stat-sub"><span style={{ color: 'var(--text3)' }}>{margin}% margin</span></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Products <i className="ti ti-database" style={{ color: 'var(--accent2)' }} /></div>
          <div className="stat-value">{products.length}</div>
          <div className="stat-sub"><span className="dn">{lowCount} low stock</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inventory Value <i className="ti ti-box" style={{ color: 'var(--blue)' }} /></div>
          <div className="stat-value">{ph(invVal)}</div>
          <div className="stat-sub" style={{ color: 'var(--text3)' }}>At cost price</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Sale Value <i className="ti ti-chart-line" style={{ color: 'var(--accent2)' }} /></div>
          <div className="stat-value">₱{avgVal}</div>
          <div className="stat-sub" style={{ color: 'var(--text3)' }}>per transaction today</div>
        </div>
      </div>

      {receivables > 0 && (
        <div className="stat-card" style={{ marginBottom: 22, background: 'rgba(245,166,35,0.05)', borderColor: 'rgba(245,166,35,0.25)' }}>
          <div className="stat-label">Receivables <i className="ti ti-clock-exclamation" style={{ color: 'var(--amber)' }} /></div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{ph(receivables)}</div>
          <div className="stat-sub"><span style={{ color: 'var(--text3)' }}>Unpaid credit sales</span></div>
        </div>
      )}

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <h2><i className="ti ti-chart-bar" style={{ marginRight: 6, color: 'var(--accent2)' }} />Sales This Week</h2>
            <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{ph(weekTotal)} total</span>
          </div>
          <div className="chart-bars">
            {chartDays.map((d, i) => (
              <div key={i} className="bar-wrap">
                <div className="bar-val">{d.rev > 0 ? `₱${(d.rev / 1000).toFixed(1)}k` : '—'}</div>
                <div
                  className="bar"
                  style={{
                    height: Math.max(4, Math.round(d.rev / maxBar * 110)),
                    background: d.isToday ? 'var(--accent)' : 'rgba(124,110,245,0.4)',
                  }}
                />
                <div className="bar-label" style={{ color: d.isToday ? 'var(--accent2)' : undefined }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2><i className="ti ti-trending-up" style={{ marginRight: 6, color: 'var(--green)' }} />Top Products</h2>
          </div>
          {topProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>No sales recorded yet.</div>
          ) : (
            topProducts.map((p, i) => (
              <div key={i} className="top-item">
                <div className="top-rank">{i + 1}</div>
                <div className="top-info"><p>{p.name}</p><span>{p.qty} units sold</span></div>
                <div className="top-sales">₱{p.rev.toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="card">
        <div className="card-header">
          <h2><i className="ti ti-clock" style={{ marginRight: 6, color: 'var(--blue)' }} />Recent Transactions</h2>
        </div>
        {!transactions.length ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>No transactions yet.</div>
        ) : (
          [...transactions].reverse().slice(0, 6).map(t => (
            <div key={t.id} className="txn-item">
              <div>
                <div className="txn-id">#{t.id}</div>
                <div className="txn-time">{t.time}</div>
              </div>
              <div style={{ flex: 1, padding: '0 12px', fontSize: 12, color: 'var(--text2)' }}>{t.items.length} item(s)</div>
              <div style={{ textAlign: 'right' }}>
                <div className="txn-amount">₱{t.total.toFixed(2)}</div>
                <div className="txn-method">{t.payment}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
