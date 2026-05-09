import type { Product, Transaction, Expense } from '../types'

interface Props {
  products: Product[]
  transactions: Transaction[]
  expenses: Expense[]
}

const ph = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 })

export default function Dashboard({ products, transactions, expenses }: Props) {
  const todayRev = transactions.reduce((s, t) => s + t.total, 0)
  const todayCOGS = transactions.reduce((s, t) => s + (t.cogs || 0), 0)
  const todayItems = transactions.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0)
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = todayRev - todayCOGS - totalExp
  const margin = todayRev > 0 ? Math.round(netProfit / todayRev * 100) : 0
  const lowCount = products.filter(p => p.stock <= p.lowStock).length
  const invVal = products.reduce((s, p) => s + p.stock * p.cost, 0)
  const avgVal = transactions.length ? Math.round(todayRev / transactions.length) : 0

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const simData = [8450, 11200, 9300, 14600, 13100, 16800, todayRev]
  const maxBar = Math.max(...simData, 1)
  const weekTotal = simData.reduce((a, b) => a + b, 0)

  const prodSales: Record<number, { name: string; qty: number; rev: number }> = {}
  transactions.forEach(t => t.items.forEach(i => {
    if (!prodSales[i.id]) prodSales[i.id] = { name: i.name, qty: 0, rev: 0 }
    prodSales[i.id].qty += i.qty
    prodSales[i.id].rev += i.price * i.qty
  }))
  const simTop = Object.values(prodSales).sort((a, b) => b.rev - a.rev).slice(0, 5)
  const topProducts = simTop.length ? simTop : [
    { name: 'Coca-Cola 1.5L', qty: 24, rev: 1800 },
    { name: 'Lucky Me Pancit', qty: 80, rev: 1200 },
    { name: 'Sky Flakes', qty: 45, rev: 1260 },
    { name: 'Del Monte Sauce', qty: 30, rev: 1350 },
    { name: 'Sprite 1.5L', qty: 20, rev: 1440 },
  ]

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Revenue <i className="ti ti-cash" style={{ color: 'var(--green)' }} /></div>
          <div className="stat-value">{ph(todayRev)}</div>
          <div className="stat-sub"><span className="up">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</span></div>
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
          <div className="stat-sub" style={{ color: 'var(--text3)' }}>per transaction</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <h2><i className="ti ti-chart-bar" style={{ marginRight: 6, color: 'var(--accent2)' }} />Sales This Week</h2>
            <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>₱{weekTotal.toLocaleString('en-PH')} total</span>
          </div>
          <div className="chart-bars">
            {days.map((d, i) => (
              <div key={d} className="bar-wrap">
                <div className="bar-val">₱{(simData[i] / 1000).toFixed(1)}k</div>
                <div
                  className="bar"
                  style={{
                    height: Math.max(8, Math.round(simData[i] / maxBar * 110)),
                    background: i === 6 ? 'var(--accent)' : 'rgba(124,110,245,0.4)',
                  }}
                />
                <div className="bar-label">{d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2><i className="ti ti-trending-up" style={{ marginRight: 6, color: 'var(--green)' }} />Top Products</h2>
          </div>
          {topProducts.map((p, i) => (
            <div key={i} className="top-item">
              <div className="top-rank">{i + 1}</div>
              <div className="top-info"><p>{p.name}</p><span>{p.qty} units sold</span></div>
              <div className="top-sales">₱{p.rev.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="card">
        <div className="card-header">
          <h2><i className="ti ti-clock" style={{ marginRight: 6, color: 'var(--blue)' }} />Recent Transactions</h2>
        </div>
        {!transactions.length ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>No transactions yet today.</div>
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
