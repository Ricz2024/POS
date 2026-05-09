import { useState, useEffect } from 'react'
import type { View } from '../types'

interface Props {
  view: View
  onAddProduct: () => void
  onAddExpense: () => void
  onNewOrder: () => void
}

const titles: Record<View, string> = {
  dashboard: 'Dashboard',
  pos: 'Point of Sale',
  inventory: 'Inventory',
  expenses: 'Expenses',
  reports: 'Reports & Analytics',
}

export default function TopBar({ view, onAddProduct, onAddExpense, onNewOrder }: Props) {
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const update = () =>
      setDateStr(new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }))
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleAction = () => {
    if (view === 'pos') onNewOrder()
    else if (view === 'expenses') onAddExpense()
    else onAddProduct()
  }

  const actionIcon = view === 'pos' ? 'ti-refresh' : view === 'reports' ? 'ti-download' : 'ti-plus'
  const actionLabel = view === 'pos' ? 'New Order' : view === 'expenses' ? 'Log Expense' : view === 'reports' ? 'Export' : 'Add Product'

  return (
    <div className="topbar">
      <h1>{titles[view]}</h1>
      <div className="topbar-right">
        <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{dateStr}</div>
        <button className="btn btn-accent" onClick={handleAction}>
          <i className={`ti ${actionIcon}`} /> {actionLabel}
        </button>
      </div>
    </div>
  )
}
