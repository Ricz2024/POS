import { useState } from 'react'
import type { Expense, Transaction } from '../types'

interface Props {
  expenses: Expense[]
  transactions: Transaction[]
  onAdd: () => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  // onAdd kept in props for TopBar wiring via App.tsx
}

const CAT_COLORS: Record<string, string> = {
  Rent: 'var(--accent2)', Utilities: 'var(--blue)', Salaries: 'var(--green)',
  Supplies: 'var(--amber)', 'Supplier Payment': 'var(--red)', Maintenance: 'var(--text2)', Other: 'var(--text3)',
}

const CATEGORIES = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Supplier Payment', 'Maintenance', 'Other']

const ph = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 })

export default function Expenses({ expenses, transactions, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')

  const totalRev = transactions.reduce((s, t) => s + t.total, 0)
  const totalCOGS = transactions.reduce((s, t) => s + (t.cogs || 0), 0)
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0)
  const grossProfit = totalRev - totalCOGS
  const netProfit = grossProfit - totalExp
  const netMargin = totalRev > 0 ? Math.round(netProfit / totalRev * 100) : 0

  const filtered = expenses.filter(e => {
    const matchQ = !search || e.desc.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase())
    const matchC = !catFilter || e.category === catFilter
    return matchQ && matchC
  })

  const wfMax = Math.max(totalRev, totalCOGS + totalExp, 1)
  const wfRows = [
    { label: 'Gross Revenue', value: totalRev, color: 'var(--green)', sign: '+', bold: false },
    { label: 'Cost of Goods Sold', value: totalCOGS, color: 'var(--blue)', sign: '−', bold: false },
    { label: 'Gross Profit', value: grossProfit, color: 'var(--accent2)', sign: '=', bold: true },
    { label: 'Operating Expenses', value: totalExp, color: 'var(--amber)', sign: '−', bold: false },
    { label: 'Net Profit / Loss', value: netProfit, color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', sign: '=', bold: true },
  ]

  return (
    <>
      <div className="inv-header">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="inv-search">
            <i className="ti ti-search" style={{ color: 'var(--text3)', fontSize: 15 }} />
            <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 160, padding: '8px 12px', fontSize: 13 }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>
          ₱{filtered.reduce((s, e) => s + e.amount, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })} total
        </span>
      </div>

      {/* P&L summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue <i className="ti ti-cash" style={{ color: 'var(--green)' }} /></div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{ph(totalRev)}</div>
          <div className="stat-sub" style={{ color: 'var(--text3)' }}>From sales</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cost of Goods <i className="ti ti-package" style={{ color: 'var(--blue)' }} /></div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{ph(totalCOGS)}</div>
          <div className="stat-sub" style={{ color: 'var(--text3)' }}>Stock cost sold</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Operating Expenses <i className="ti ti-file-invoice" style={{ color: 'var(--amber)' }} /></div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{ph(totalExp)}</div>
          <div className="stat-sub" style={{ color: 'var(--text3)' }}>{expenses.length} entries</div>
        </div>
        <div className="stat-card" style={{
          borderColor: netProfit >= 0 ? 'rgba(34,201,123,0.25)' : 'rgba(240,82,82,0.25)',
          background: netProfit >= 0 ? 'rgba(34,201,123,0.05)' : 'rgba(240,82,82,0.05)',
        }}>
          <div className="stat-label">Net Profit <i className="ti ti-trending-up" style={{ color: 'var(--green)' }} /></div>
          <div className="stat-value" style={{ color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>{ph(netProfit)}</div>
          <div className="stat-sub"><span style={{ color: 'var(--text3)' }}>{netMargin}% net margin</span></div>
        </div>
      </div>

      {/* Waterfall */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h2><i className="ti ti-chart-waterfall" style={{ marginRight: 6, color: 'var(--accent2)' }} />Profit & Loss Breakdown</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {wfRows.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 14, textAlign: 'center', fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{r.sign}</div>
              <div style={{ width: 180, fontSize: 13, fontWeight: r.bold ? 500 : undefined }}>{r.label}</div>
              <div style={{ flex: 1, height: 8, background: 'var(--bg4)', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.abs(r.value) / wfMax * 100)}%`, background: r.color, borderRadius: 4, opacity: r.bold ? 1 : 0.8 }} />
              </div>
              <div style={{ width: 110, textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, color: r.color, fontWeight: r.bold ? 500 : undefined }}>
                ₱{r.value.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th><th>Notes</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {!filtered.length ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text3)' }}>No expenses found.</td></tr>
            ) : [...filtered].reverse().map(e => (
              <tr key={e.id}>
                <td style={{ fontWeight: 500 }}>{e.desc}</td>
                <td><span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: CAT_COLORS[e.category] || 'var(--text2)' }}>{e.category}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{e.date}</td>
                <td style={{ fontFamily: 'var(--mono)', color: 'var(--red)', fontWeight: 500 }}>₱{e.amount.toFixed(2)}</td>
                <td style={{ fontSize: 12, color: 'var(--text2)' }}>{e.notes || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="btn btn-sm" onClick={() => onEdit(e.id)}><i className="ti ti-edit" /></button>
                    <button className="btn btn-sm btn-red" onClick={() => onDelete(e.id)}><i className="ti ti-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
