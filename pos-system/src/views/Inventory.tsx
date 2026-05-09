import { useState } from 'react'
import type { Product } from '../types'

interface Props {
  products: Product[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onRestock: (id: number) => void
  onAdd: () => void
}

export default function Inventory({ products, onEdit, onDelete, onRestock }: Props) {
  const [search, setSearch] = useState('')

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="inv-header">
        <div className="inv-search">
          <i className="ti ti-search" style={{ color: 'var(--text3)', fontSize: 15 }} />
          <input type="text" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{filtered.length} of {products.length} products</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Cost</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const pct = Math.min(100, Math.round(p.stock / (p.lowStock * 4) * 100))
              const fillColor = p.stock <= 0 ? 'var(--red)' : p.stock <= p.lowStock ? 'var(--amber)' : 'var(--green)'
              const statusEl = p.stock <= 0
                ? <span className="badge badge-red">Out</span>
                : p.stock <= p.lowStock
                  ? <span className="badge badge-amber">Low</span>
                  : <span className="badge badge-green">OK</span>

              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{p.icon}</span>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                    </div>
                  </td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{p.sku}</span></td>
                  <td><span style={{ color: 'var(--text2)', fontSize: 12 }}>{p.category}</span></td>
                  <td style={{ fontFamily: 'var(--mono)' }}>₱{p.price.toFixed(2)}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>₱{p.cost.toFixed(2)}</td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13, color: p.stock <= p.lowStock && p.stock > 0 ? 'var(--amber)' : undefined }}>{p.stock}</div>
                    <div className="stock-bar">
                      <div className="stock-fill" style={{ width: `${pct}%`, background: fillColor }} />
                    </div>
                  </td>
                  <td>{statusEl}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-sm" onClick={() => onEdit(p.id)}><i className="ti ti-edit" /></button>
                      <button className="btn btn-sm" onClick={() => onRestock(p.id)}><i className="ti ti-plus" /> Stock</button>
                      <button className="btn btn-sm btn-red" onClick={() => onDelete(p.id)}><i className="ti ti-trash" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
