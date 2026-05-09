import { supabase } from './supabase'
import type { Product, Expense, Transaction, CartItem } from '../types'

// ── helpers ──────────────────────────────────────────────────────────────────

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id:       row.id as number,
    name:     row.name as string,
    sku:      row.sku as string,
    category: row.category as string,
    price:    Number(row.price),
    cost:     Number(row.cost),
    stock:    row.stock as number,
    lowStock: row.low_stock as number,
    icon:     row.icon as string,
  }
}

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id:       row.id as number,
    desc:     row.description as string,
    category: row.category as string,
    amount:   Number(row.amount),
    date:     row.date as string,
    ref:      (row.ref as string) ?? '',
    notes:    (row.notes as string) ?? '',
  }
}

function mapTransaction(
  row: Record<string, unknown>,
  items: CartItem[]
): Transaction {
  return {
    id:       row.id as string,
    time:     row.time as string,
    payment:  row.payment as string,
    subtotal: Number(row.subtotal),
    tax:      Number(row.tax),
    total:    Number(row.total),
    cogs:     Number(row.cogs),
    date:     row.date as string,
    items,
  }
}

function mapItem(row: Record<string, unknown>): CartItem {
  return {
    id:    row.product_id as number,
    name:  row.name as string,
    price: Number(row.price),
    qty:   row.qty as number,
    icon:  row.icon as string,
  }
}

// ── products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  console.log('[db] fetchProducts →')
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id')
  if (error) { console.error('[db] fetchProducts ✗', error); throw error }
  console.log('[db] fetchProducts ✓', data?.length, 'rows')
  return (data ?? []).map(mapProduct)
}

export async function insertProduct(p: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({ name: p.name, sku: p.sku, category: p.category, price: p.price, cost: p.cost, stock: p.stock, low_stock: p.lowStock, icon: p.icon })
    .select()
    .single()
  if (error) throw error
  return mapProduct(data)
}

export async function updateProduct(id: number, p: Partial<Omit<Product, 'id'>>): Promise<Product> {
  const patch: Record<string, unknown> = {}
  if (p.name      !== undefined) patch.name      = p.name
  if (p.sku       !== undefined) patch.sku       = p.sku
  if (p.category  !== undefined) patch.category  = p.category
  if (p.price     !== undefined) patch.price     = p.price
  if (p.cost      !== undefined) patch.cost      = p.cost
  if (p.stock     !== undefined) patch.stock     = p.stock
  if (p.lowStock  !== undefined) patch.low_stock = p.lowStock
  if (p.icon      !== undefined) patch.icon      = p.icon

  const { data, error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapProduct(data)
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ── expenses ─────────────────────────────────────────────────────────────────

export async function fetchExpenses(): Promise<Expense[]> {
  console.log('[db] fetchExpenses →')
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('id')
  if (error) { console.error('[db] fetchExpenses ✗', error); throw error }
  console.log('[db] fetchExpenses ✓', data?.length, 'rows')
  return (data ?? []).map(mapExpense)
}

export async function insertExpense(e: Omit<Expense, 'id'>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ description: e.desc, category: e.category, amount: e.amount, date: e.date, ref: e.ref, notes: e.notes })
    .select()
    .single()
  if (error) throw error
  return mapExpense(data)
}

export async function updateExpense(id: number, e: Partial<Omit<Expense, 'id'>>): Promise<Expense> {
  const patch: Record<string, unknown> = {}
  if (e.desc     !== undefined) patch.description = e.desc
  if (e.category !== undefined) patch.category    = e.category
  if (e.amount   !== undefined) patch.amount      = e.amount
  if (e.date     !== undefined) patch.date        = e.date
  if (e.ref      !== undefined) patch.ref         = e.ref
  if (e.notes    !== undefined) patch.notes       = e.notes

  const { data, error } = await supabase
    .from('expenses')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapExpense(data)
}

export async function deleteExpense(id: number): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ── transactions ──────────────────────────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  console.log('[db] fetchTransactions →')
  const { data: txRows, error: txErr } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at')
  if (txErr) { console.error('[db] fetchTransactions ✗', txErr); throw txErr }

  const { data: itemRows, error: itemErr } = await supabase
    .from('transaction_items')
    .select('*')
  if (itemErr) { console.error('[db] fetchTransactionItems ✗', itemErr); throw itemErr }

  console.log('[db] fetchTransactions ✓', txRows?.length, 'txns,', itemRows?.length, 'items')
  return (txRows ?? []).map(row =>
    mapTransaction(
      row,
      (itemRows ?? []).filter(i => i.transaction_id === row.id).map(mapItem)
    )
  )
}

export async function insertTransaction(txn: Transaction): Promise<void> {
  const { error: txErr } = await supabase.from('transactions').insert({
    id:       txn.id,
    time:     txn.time,
    payment:  txn.payment,
    subtotal: txn.subtotal,
    tax:      txn.tax,
    total:    txn.total,
    cogs:     txn.cogs,
    date:     txn.date,
  })
  if (txErr) throw txErr

  if (txn.items.length > 0) {
    const { error: itemErr } = await supabase.from('transaction_items').insert(
      txn.items.map(i => ({
        transaction_id: txn.id,
        product_id:     i.id,
        name:           i.name,
        price:          i.price,
        qty:            i.qty,
        icon:           i.icon,
      }))
    )
    if (itemErr) throw itemErr
  }
}
