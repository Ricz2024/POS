import type { Product, Expense } from './types';

export const initialProducts: Product[] = [
  { id: 1, name: 'Coca-Cola 1.5L', sku: 'BEV-001', category: 'Beverages', price: 75, cost: 55, stock: 48, lowStock: 10, icon: '🥤' },
  { id: 2, name: 'Lucky Me Pancit', sku: 'SNK-001', category: 'Snacks', price: 15, cost: 9, stock: 120, lowStock: 20, icon: '🍜' },
  { id: 3, name: 'Safeguard Soap', sku: 'PC-001', category: 'Personal Care', price: 52, cost: 38, stock: 30, lowStock: 10, icon: '🧼' },
  { id: 4, name: 'Tide Powder 1kg', sku: 'HH-001', category: 'Household', price: 125, cost: 90, stock: 25, lowStock: 8, icon: '🧺' },
  { id: 5, name: 'Sky Flakes', sku: 'SNK-002', category: 'Snacks', price: 28, cost: 18, stock: 80, lowStock: 15, icon: '🍘' },
  { id: 6, name: 'Nestlé Fresh Milk', sku: 'DRY-001', category: 'Dairy', price: 89, cost: 68, stock: 12, lowStock: 10, icon: '🥛' },
  { id: 7, name: 'Del Monte Tomato Sauce', sku: 'CAN-001', category: 'Canned Goods', price: 45, cost: 30, stock: 60, lowStock: 12, icon: '🥫' },
  { id: 8, name: 'Gardenia Loaf', sku: 'BRD-001', category: 'Bread & Bakery', price: 65, cost: 48, stock: 8, lowStock: 5, icon: '🍞' },
  { id: 9, name: 'Sprite 1.5L', sku: 'BEV-002', category: 'Beverages', price: 72, cost: 52, stock: 36, lowStock: 10, icon: '🍋' },
  { id: 10, name: 'Boy Bawang', sku: 'SNK-003', category: 'Snacks', price: 18, cost: 11, stock: 6, lowStock: 10, icon: '🧄' },
  { id: 11, name: 'Knorr Chicken Cubes', sku: 'CAN-002', category: 'Canned Goods', price: 35, cost: 22, stock: 90, lowStock: 15, icon: '🫙' },
  { id: 12, name: 'Selecta Ice Cream', sku: 'FRZ-001', category: 'Frozen', price: 185, cost: 140, stock: 14, lowStock: 5, icon: '🍨' },
];

export const initialExpenses: Expense[] = [
  { id: 1, desc: 'Monthly Rent', category: 'Rent', amount: 8000, date: '2026-05-01', ref: '', notes: 'May rent' },
  { id: 2, desc: 'Meralco Electric Bill', category: 'Utilities', amount: 2400, date: '2026-05-05', ref: 'MEL-8823', notes: '' },
  { id: 3, desc: 'Staff Salary - Ana', category: 'Salaries', amount: 5000, date: '2026-05-05', ref: '', notes: 'Semi-monthly' },
];
