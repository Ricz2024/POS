import { useState, useEffect } from 'react'
import type { Product } from '../types'

interface Props {
  open: boolean
  editId: number | null
  products: Product[]
  onSave: (data: Omit<Product, 'id'>, editId: number | null) => void
  onClose: () => void
}

const CATEGORIES = ['Beverages', 'Snacks', 'Household', 'Personal Care', 'Frozen', 'Dairy', 'Canned Goods', 'Bread & Bakery', 'Other']

const emptyForm = { name: '', sku: '', category: 'Beverages', price: '', cost: '', stock: '', lowStock: '10', icon: '🛒' }

export default function ProductModal({ open, editId, products, onSave, onClose }: Props) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editId) {
      const p = products.find(x => x.id === editId)
      if (p) setForm({ name: p.name, sku: p.sku, category: p.category, price: String(p.price), cost: String(p.cost), stock: String(p.stock), lowStock: String(p.lowStock), icon: p.icon })
    } else {
      setForm(emptyForm)
    }
  }, [open, editId, products])

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = () => {
    const price = parseFloat(form.price)
    const cost = parseFloat(form.cost)
    const stock = parseInt(form.stock)
    const lowStock = parseInt(form.lowStock) || 10
    if (!form.name || !form.sku || isNaN(price) || isNaN(cost) || isNaN(stock)) {
      alert('Please fill all required fields')
      return
    }
    onSave({ name: form.name, sku: form.sku, category: form.category, price, cost, stock, lowStock, icon: form.icon || '🛒' }, editId)
  }

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{editId ? 'Edit Product' : 'Add Product'}</h2>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input className="form-input" placeholder="e.g. Coca-Cola 1.5L" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input className="form-input" placeholder="e.g. BEV-001" value={form.sku} onChange={e => set('sku', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Selling Price (₱)</label>
            <input type="number" className="form-input" placeholder="0.00" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Cost Price (₱)</label>
            <input type="number" className="form-input" placeholder="0.00" step="0.01" value={form.cost} onChange={e => set('cost', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stock Quantity</label>
            <input type="number" className="form-input" placeholder="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Low Stock Alert</label>
            <input type="number" className="form-input" placeholder="10" value={form.lowStock} onChange={e => set('lowStock', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Icon (emoji)</label>
          <input className="form-input" placeholder="🛒" maxLength={2} value={form.icon} onChange={e => set('icon', e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" onClick={handleSave}><i className="ti ti-check" /> Save Product</button>
        </div>
      </div>
    </div>
  )
}
