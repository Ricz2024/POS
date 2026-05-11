import { useState } from 'react'
import type { Product, CartItem } from '../types'

interface Props {
  products: Product[]
  cart: CartItem[]
  cartSub: number
  cartTax: number
  cartTotal: number
  orderNum: number
  selectedPayment: string
  onAddToCart: (id: number) => void
  onChangeQty: (id: number, delta: number) => void
  onRemoveFromCart: (id: number) => void
  onClearCart: () => void
  onSelectPayment: (method: string) => void
  onCheckout: () => void
}

const PAYMENT_METHODS = [
  { key: 'cash', icon: 'ti-cash', label: 'Cash' },
  { key: 'card', icon: 'ti-credit-card', label: 'Card' },
  { key: 'gcash', icon: 'ti-device-mobile', label: 'GCash' },
  { key: 'maya', icon: 'ti-wallet', label: 'Maya' },
  { key: 'credit', icon: 'ti-calendar-event', label: 'Credit' },
]

export default function POS({ products, cart, cartSub, cartTax, cartTotal, orderNum, selectedPayment, onAddToCart, onChangeQty, onRemoveFromCart, onClearCart, onSelectPayment, onCheckout }: Props) {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const cats = ['All', ...Array.from(new Set(products.map(p => p.category)))]
  const filtered = products.filter(p => {
    const catMatch = category === 'All' || p.category === category
    const searchMatch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    return catMatch && searchMatch
  })

  return (
    <div className="pos-layout">
      {/* Products panel */}
      <div className="products-panel">
        <div className="search-bar">
          <i className="ti ti-search" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="cat-tabs">
          {cats.map(c => (
            <div key={c} className={`cat-tab ${c === category ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</div>
          ))}
        </div>
        <div className="products-grid">
          {filtered.map(p => (
            <div key={p.id} className={`product-card ${p.stock <= 0 ? 'out-of-stock' : ''}`} onClick={() => onAddToCart(p.id)}>
              {p.stock <= p.lowStock && p.stock > 0 && <div className="prod-badge">Low</div>}
              <div className="prod-icon">{p.icon}</div>
              <div className="prod-name">{p.name}</div>
              <div className="prod-price">₱{(selectedPayment === 'credit' && p.creditPrice ? p.creditPrice : p.price).toFixed(2)}</div>
              {selectedPayment === 'credit' && p.creditPrice && p.creditPrice !== p.price && (
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Regular: ₱{p.price.toFixed(2)}</div>
              )}
              <div className="prod-stock">{p.stock <= 0 ? 'Out of stock' : `${p.stock} in stock`}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart panel */}
      <div className="cart-panel">
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2><i className="ti ti-shopping-cart" style={{ marginRight: 6, color: 'var(--accent2)' }} />Current Order</h2>
            <button className="btn btn-sm" onClick={onClearCart}><i className="ti ti-trash" /> Clear</button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
            Order #<span style={{ fontFamily: 'var(--mono)' }}>{orderNum}</span>
          </div>
        </div>

        <div className="cart-items">
          {!cart.length ? (
            <div className="cart-empty">
              <i className="ti ti-shopping-cart-off" />
              <p>Cart is empty</p>
              <p style={{ fontSize: 11 }}>Click a product to add</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div style={{ fontSize: 18 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-sub">₱{(selectedPayment === 'credit' && item.creditPrice ? item.creditPrice : item.price).toFixed(2)} each</div>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => onChangeQty(item.id, -1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => onChangeQty(item.id, 1)}>+</button>
                </div>
                <div className="cart-item-total">₱{((selectedPayment === 'credit' && item.creditPrice ? item.creditPrice : item.price) * item.qty).toFixed(2)}</div>
                <button className="remove-btn" onClick={() => onRemoveFromCart(item.id)}><i className="ti ti-x" /></button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-subtotal"><span>Subtotal</span><span>₱{cartSub.toFixed(2)}</span></div>
          <div className="cart-subtotal"><span>Tax (12%)</span><span>₱{cartTax.toFixed(2)}</span></div>
          <div className="cart-total"><span>Total</span><span>₱{cartTotal.toFixed(2)}</span></div>
          <div className="payment-methods">
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm.key}
                className={`pay-btn ${selectedPayment === pm.key ? 'selected' : ''}`}
                onClick={() => onSelectPayment(pm.key)}
              >
                <i className={`ti ${pm.icon}`} /> {pm.label}
              </button>
            ))}
          </div>
          <button className="checkout-btn" onClick={onCheckout} disabled={!cart.length}>
            <i className="ti ti-check" /> Process Payment
          </button>
        </div>
      </div>
    </div>
  )
}
