import { useState } from 'react'
import type { Product, Transaction, Expense } from '../types'

interface Props {
  products: Product[]
  transactions: Transaction[]
  expenses: Expense[]
}

const ph = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 })

export default function Reports({ products, transactions, expenses }: Props) {
  const [period, setPeriod] = useState('Today')

  const totalRev = transactions.reduce((s, t) => s + t.total, 0)
  const totalCOGS = transactions.reduce((s, t) => s + (t.cogs || 0), 0)
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0)
  const grossProfit = totalRev - totalCOGS
  const netProfit = grossProfit - totalExp
  const grossMargin = totalRev > 0 ? Math.round(grossProfit / totalRev * 100) : 0
  const netMargin = totalRev > 0 ? Math.round(netProfit / totalRev * 100) : 0

  const plRows = [
    { label: 'Gross Revenue', val: totalRev, color: 'var(--text)', indent: false, divider: false },
    { label: 'Cost of Goods Sold', val: -totalCOGS, color: 'var(--red)', indent: true, divider: false },
    { label: 'Gross Profit', val: grossProfit, color: 'var(--accent2)', indent: false, divider: true, bold: true },
    { label: 'Operating Expenses', val: -totalExp, color: 'var(--amber)', indent: true, divider: false },
    { label: 'Net Profit / Loss', val: netProfit, color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', indent: false, divider: true, bold: true },
  ]

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'Today']
  const simRev = [8450, 11200, 9300, 14600, 13100, 16800, totalRev]
  const simCOGS = [5900, 7840, 6510, 10220, 9170, 11760, totalCOGS]
  const simExp = [2400, 2400, 2400, 2400, 2400, 2400, totalExp]
  const maxV = Math.max(...simRev, 1)

  const pmethods: Record<string, number> = {}
  transactions.forEach(t => { pmethods[t.payment] = (pmethods[t.payment] || 0) + t.total })
  const simMethods = Object.keys(pmethods).length ? pmethods : { cash: 5200, card: 2800, gcash: 3100, maya: 1400 }
  const sTotal = Object.values(simMethods).reduce((a, b) => a + b, 0)
  const payColors: Record<string, string> = { cash: 'var(--green)', card: 'var(--blue)', gcash: 'var(--accent2)', maya: 'var(--amber)' }
  const payLabels: Record<string, string> = { cash: 'Cash', card: 'Card', gcash: 'GCash', maya: 'Maya' }

  const totalP = products.length
  const invOk = products.filter(p => p.stock > p.lowStock).length
  const invLow = products.filter(p => p.stock > 0 && p.stock <= p.lowStock).length
  const invOut = products.filter(p => p.stock <= 0).length

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>Analytics & profit overview for your store</div>
        <div className="report-period">
          {['Today', 'Week', 'Month'].map(p => (
            <button key={p} className={`period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Gross Revenue <i className="ti ti-cash" style={{ color: 'var(--green)' }} /></div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{ph(totalRev)}</div>
          <div className="stat-sub"><span>{transactions.length}</span> transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cost of Goods Sold <i className="ti ti-package" style={{ color: 'var(--blue)' }} /></div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{ph(totalCOGS)}</div>
          <div className="stat-sub" style={{ color: 'var(--text3)' }}>Gross margin {grossMargin}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Operating Expenses <i className="ti ti-file-invoice" style={{ color: 'var(--amber)' }} /></div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{ph(totalExp)}</div>
          <div className="stat-sub" style={{ color: 'var(--text3)' }}>{expenses.length} entries</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(34,201,123,0.25)', background: 'rgba(34,201,123,0.05)' }}>
          <div className="stat-label">Net Profit <i className="ti ti-trending-up" style={{ color: 'var(--green)' }} /></div>
          <div className="stat-value" style={{ color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>{ph(netProfit)}</div>
          <div className="stat-sub"><span style={{ color: 'var(--text3)' }}>{netMargin}% net margin</span></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* P&L Statement */}
        <div className="card">
          <div className="card-header"><h2><i className="ti ti-report-money" style={{ marginRight: 6, color: 'var(--accent2)' }} />P&L Statement</h2></div>
          {plRows.map((r, i) => (
            <div key={i}>
              {r.divider && <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', paddingLeft: r.indent ? 12 : 0 }}>
                <span style={{ fontSize: 13, color: r.indent ? 'var(--text2)' : 'var(--text)' }}>{r.label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: r.color, fontWeight: r.bold ? 500 : undefined }}>
                  {r.val >= 0 ? '' : '−'}₱{Math.abs(r.val).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue vs Expenses chart */}
        <div className="card">
          <div className="card-header"><h2><i className="ti ti-chart-bar" style={{ marginRight: 6, color: 'var(--green)' }} />Revenue vs Expenses</h2></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
            {days.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ flex: 1, background: i === 6 ? 'var(--accent)' : 'rgba(124,110,245,0.5)', borderRadius: '2px 2px 0 0', height: Math.max(3, Math.round(simRev[i] / maxV * 90)) }} />
                  <div style={{ flex: 1, background: i === 6 ? 'var(--red)' : 'rgba(240,82,82,0.5)', borderRadius: '2px 2px 0 0', height: Math.max(3, Math.round(simCOGS[i] / maxV * 90)) }} />
                  <div style={{ flex: 1, background: i === 6 ? 'var(--amber)' : 'rgba(245,166,35,0.5)', borderRadius: '2px 2px 0 0', height: Math.max(3, Math.round(simExp[i] / maxV * 90)) }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 12 }}>
            {[{ color: 'var(--accent)', label: 'Revenue' }, { color: 'var(--red)', label: 'COGS' }, { color: 'var(--amber)', label: 'Expenses' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                <span style={{ color: 'var(--text2)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Payment methods */}
        <div className="card">
          <div className="card-header"><h2>Payment Methods</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {Object.entries(simMethods).map(([k, v]) => (
              <div key={k}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>{payLabels[k] || k}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{Math.round(v / sTotal * 100)}%  ₱{v.toLocaleString()}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${Math.round(v / sTotal * 100)}%`, background: payColors[k] || 'var(--accent)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory health */}
        <div className="card">
          <div className="card-header"><h2>Inventory Health</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {[{ label: 'In Stock', count: invOk, color: 'var(--green)' }, { label: 'Low Stock', count: invLow, color: 'var(--amber)' }, { label: 'Out of Stock', count: invOut, color: 'var(--red)' }].map(s => (
              <div key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>{s.label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{s.count} / {totalP}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${totalP ? Math.round(s.count / totalP * 100) : 0}%`, background: s.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All transactions */}
      <div className="card">
        <div className="card-header"><h2>All Transactions</h2></div>
        {!transactions.length ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>No transactions recorded.</div>
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr><th>ID</th><th>Time</th><th>Items</th><th>COGS</th><th>Payment</th><th>Revenue</th><th>Gross Profit</th></tr>
            </thead>
            <tbody>
              {[...transactions].reverse().map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent2)' }}>{t.id}</td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{t.time}</td>
                  <td style={{ fontSize: 12 }}>{t.items.map(i => `${i.name} x${i.qty}`).join(', ')}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)' }}>₱{(t.cogs || 0).toFixed(2)}</td>
                  <td><span className="badge" style={{ background: 'rgba(124,110,245,0.15)', color: 'var(--accent2)' }}>{t.payment}</span></td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>₱{t.total.toFixed(2)}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>₱{(t.total - (t.cogs || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
