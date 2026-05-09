import { useState, useEffect } from 'react'
import type { Expense } from '../types'

interface Props {
  open: boolean
  editId: number | null
  expenses: Expense[]
  onSave: (data: Omit<Expense, 'id'>, editId: number | null) => void
  onClose: () => void
}

const CATEGORIES = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Supplier Payment', 'Maintenance', 'Other']

const emptyForm = () => ({ desc: '', category: 'Rent', amount: '', date: new Date().toISOString().split('T')[0], ref: '', notes: '' })

export default function ExpenseModal({ open, editId, expenses, onSave, onClose }: Props) {
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (!open) return
    if (editId) {
      const e = expenses.find(x => x.id === editId)
      if (e) setForm({ desc: e.desc, category: e.category, amount: String(e.amount), date: e.date, ref: e.ref, notes: e.notes })
    } else {
      setForm(emptyForm())
    }
  }, [open, editId, expenses])

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = () => {
    const amount = parseFloat(form.amount)
    if (!form.desc || isNaN(amount) || amount <= 0) {
      alert('Please fill description and amount')
      return
    }
    onSave({ desc: form.desc, category: form.category, amount, date: form.date, ref: form.ref, notes: form.notes }, editId)
  }

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{editId ? 'Edit Expense' : 'Log Expense'}</h2>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-input" placeholder="e.g. Monthly rent payment" value={form.desc} onChange={e => set('desc', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₱)</label>
            <input type="number" className="form-input" placeholder="0.00" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Reference / Receipt #</label>
            <input className="form-input" placeholder="Optional" value={form.ref} onChange={e => set('ref', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <input className="form-input" placeholder="Optional notes" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" onClick={handleSave}><i className="ti ti-check" /> Save Expense</button>
        </div>
      </div>
    </div>
  )
}
