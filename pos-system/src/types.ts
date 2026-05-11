export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  lowStock: number;
  icon: string;
    creditPrice?: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  icon: string;
  creditPrice?: number;
}

export interface Transaction {
  id: string;
  time: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  cogs: number;
  payment: string;
  date: string;
  paid: boolean;
  dueDate: string | null;
}

export interface Expense {
  id: number;
  desc: string;
  category: string;
  amount: number;
  date: string;
  ref: string;
  notes: string;
}

export type View = 'dashboard' | 'pos' | 'inventory' | 'expenses' | 'reports';

export interface ToastItem {
  id: number;
  msg: string;
  icon: string;
}
