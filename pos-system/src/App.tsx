import { useState, useCallback, useEffect } from 'react'
import './App.css'
import type { Product, CartItem, Transaction, Expense, View, ToastItem } from './types'
import * as db from './lib/db'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Toast from './components/Toast'
import Dashboard from './views/Dashboard'
import POS from './views/POS'
import Inventory from './views/Inventory'
import Expenses from './views/Expenses'
import Reports from './views/Reports'
import ProductModal from './components/ProductModal'
import ReceiptModal from './components/ReceiptModal'
import ExpenseModal from './components/ExpenseModal'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedPayment, setSelectedPayment] = useState('cash')
  const [orderNum, setOrderNum] = useState(1001)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [loading, setLoading] = useState(true)
  const [productModal, setProductModal] = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null })
  const [expenseModal, setExpenseModal] = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null })
  const [receiptModal, setReceiptModal] = useState<{ open: boolean; txn: Transaction | null }>({ open: false, txn: null })

  const showToast = useCallback((msg: string, icon = 'ti-check') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, icon }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3300)
  }, [])

  // ── Load all data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      db.fetchProducts(),
      db.fetchExpenses(),
      db.fetchTransactions(),
    ]).then(([prods, exps, txns]) => {
      setProducts(prods)
      setExpenses(exps)
      setTransactions(txns)
      if (txns.length > 0) {
        const lastNum = parseInt(txns[txns.length - 1].id.replace('TXN-', '')) || 1000
        setOrderNum(lastNum + 1)
      }
    }).catch(err => {
      showToast('Failed to load data: ' + err.message, 'ti-alert-triangle')
    }).finally(() => setLoading(false))
  }, [showToast])

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = (id: number) => {
    const p = products.find(x => x.id === id)
    if (!p || p.stock <= 0) return
    setCart(prev => {
      const existing = prev.find(x => x.id === id)
      if (existing) {
        if (existing.qty >= p.stock) { showToast('Max stock reached', 'ti-alert-triangle'); return prev }
        return prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x)
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1, icon: p.icon }]
    })
  }

  const changeQty = (id: number, delta: number) => {
    const prod = products.find(x => x.id === id)
    setCart(prev =>
      prev
        .map(x => x.id === id ? { ...x, qty: Math.min(x.qty + delta, prod?.stock ?? x.qty) } : x)
        .filter(x => x.qty > 0)
    )
  }

  const removeFromCart = (id: number) => setCart(prev => prev.filter(x => x.id !== id))

  const clearCart = () => {
    setCart([])
    setOrderNum(n => n + 1)
  }

  const checkout = async () => {
    if (!cart.length) return
    const sub = cart.reduce((s, i) => s + i.price * i.qty, 0)
    const tax = sub * 0.12
    const total = sub + tax
    let cogs = 0

    const stockUpdates: { id: number; newStock: number }[] = []
    for (const item of cart) {
      const p = products.find(x => x.id === item.id)
      if (p) {
        cogs += p.cost * item.qty
        stockUpdates.push({ id: p.id, newStock: p.stock - item.qty })
      }
    }

    const txn: Transaction = {
      id: 'TXN-' + String(orderNum).padStart(4, '0'),
      time: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
      items: cart.map(i => ({ ...i })),
      subtotal: sub, tax, total, cogs,
      payment: selectedPayment,
      date: new Date().toLocaleDateString(),
    }

    try {
      await db.insertTransaction(txn)
      await Promise.all(stockUpdates.map(u => db.updateProduct(u.id, { stock: u.newStock })))
      setProducts(prev => prev.map(p => {
        const u = stockUpdates.find(x => x.id === p.id)
        return u ? { ...p, stock: u.newStock } : p
      }))
      setTransactions(prev => [...prev, txn])
      setReceiptModal({ open: true, txn })
      setCart([])
      setOrderNum(n => n + 1)
      showToast('Payment processed! ₱' + total.toFixed(2), 'ti-check')
    } catch (err: unknown) {
      showToast('Checkout failed: ' + (err as Error).message, 'ti-alert-triangle')
    }
  }

  // ── Products CRUD ─────────────────────────────────────────────────────────
  const saveProduct = async (data: Omit<Product, 'id'>, editId: number | null) => {
    try {
      if (editId) {
        const updated = await db.updateProduct(editId, data)
        setProducts(prev => prev.map(p => p.id === editId ? updated : p))
        showToast('Product updated', 'ti-check')
      } else {
        const created = await db.insertProduct(data)
        setProducts(prev => [...prev, created])
        showToast('Product added', 'ti-check')
      }
      setProductModal({ open: false, editId: null })
    } catch (err: unknown) {
      showToast('Save failed: ' + (err as Error).message, 'ti-alert-triangle')
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return
    try {
      await db.deleteProduct(id)
      setProducts(prev => prev.filter(x => x.id !== id))
      setCart(prev => prev.filter(x => x.id !== id))
      showToast('Product deleted', 'ti-trash')
    } catch (err: unknown) {
      showToast('Delete failed: ' + (err as Error).message, 'ti-alert-triangle')
    }
  }

  const quickRestock = async (id: number) => {
    const p = products.find(x => x.id === id)
    if (!p) return
    const qty = prompt(`Restock "${p.name}"\nCurrent stock: ${p.stock}\nAdd quantity:`)
    if (!qty || isNaN(Number(qty)) || parseInt(qty) <= 0) return
    const newStock = p.stock + parseInt(qty)
    try {
      await db.updateProduct(id, { stock: newStock })
      setProducts(prev => prev.map(x => x.id === id ? { ...x, stock: newStock } : x))
      showToast(`Restocked ${p.name} +${qty}`, 'ti-package')
    } catch (err: unknown) {
      showToast('Restock failed: ' + (err as Error).message, 'ti-alert-triangle')
    }
  }

  // ── Expenses CRUD ─────────────────────────────────────────────────────────
  const saveExpense = async (data: Omit<Expense, 'id'>, editId: number | null) => {
    try {
      if (editId) {
        const updated = await db.updateExpense(editId, data)
        setExpenses(prev => prev.map(e => e.id === editId ? updated : e))
        showToast('Expense updated', 'ti-check')
      } else {
        const created = await db.insertExpense(data)
        setExpenses(prev => [...prev, created])
        showToast('Expense logged: ₱' + data.amount.toFixed(2), 'ti-check')
      }
      setExpenseModal({ open: false, editId: null })
    } catch (err: unknown) {
      showToast('Save failed: ' + (err as Error).message, 'ti-alert-triangle')
    }
  }

  const deleteExpense = async (id: number) => {
    if (!confirm('Delete this expense entry?')) return
    try {
      await db.deleteExpense(id)
      setExpenses(prev => prev.filter(x => x.id !== id))
      showToast('Expense deleted', 'ti-trash')
    } catch (err: unknown) {
      showToast('Delete failed: ' + (err as Error).message, 'ti-alert-triangle')
    }
  }

  const cartSub = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartTax = cartSub * 0.12
  const cartTotal = cartSub + cartTax

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: 'var(--text2)' }}>
        <i className="ti ti-loader" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>Connecting to database…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <>
      <Sidebar currentView={view} onNavigate={setView} />

      <div className="main">
        <TopBar
          view={view}
          onAddProduct={() => setProductModal({ open: true, editId: null })}
          onAddExpense={() => setExpenseModal({ open: true, editId: null })}
          onNewOrder={clearCart}
        />
        <div className="content">
          {view === 'dashboard' && (
            <Dashboard products={products} transactions={transactions} expenses={expenses} />
          )}
          {view === 'pos' && (
            <POS
              products={products}
              cart={cart}
              cartSub={cartSub}
              cartTax={cartTax}
              cartTotal={cartTotal}
              orderNum={orderNum}
              selectedPayment={selectedPayment}
              onAddToCart={addToCart}
              onChangeQty={changeQty}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              onSelectPayment={setSelectedPayment}
              onCheckout={checkout}
            />
          )}
          {view === 'inventory' && (
            <Inventory
              products={products}
              onEdit={id => setProductModal({ open: true, editId: id })}
              onDelete={deleteProduct}
              onRestock={quickRestock}
              onAdd={() => setProductModal({ open: true, editId: null })}
            />
          )}
          {view === 'expenses' && (
            <Expenses
              expenses={expenses}
              transactions={transactions}
              onAdd={() => setExpenseModal({ open: true, editId: null })}
              onEdit={id => setExpenseModal({ open: true, editId: id })}
              onDelete={deleteExpense}
            />
          )}
          {view === 'reports' && (
            <Reports products={products} transactions={transactions} expenses={expenses} />
          )}
        </div>
      </div>

      <ProductModal
        open={productModal.open}
        editId={productModal.editId}
        products={products}
        onSave={saveProduct}
        onClose={() => setProductModal({ open: false, editId: null })}
      />
      <ReceiptModal
        open={receiptModal.open}
        txn={receiptModal.txn}
        onClose={() => setReceiptModal({ open: false, txn: null })}
      />
      <ExpenseModal
        open={expenseModal.open}
        editId={expenseModal.editId}
        expenses={expenses}
        onSave={saveExpense}
        onClose={() => setExpenseModal({ open: false, editId: null })}
      />

      <div className="toast-wrap">
        {toasts.map(t => <Toast key={t.id} msg={t.msg} icon={t.icon} />)}
      </div>
    </>
  )
}
