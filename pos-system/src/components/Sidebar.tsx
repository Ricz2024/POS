import type { View } from '../types'

interface Props {
  currentView: View
  onNavigate: (view: View) => void
}

export default function Sidebar({ currentView, onNavigate }: Props) {
  const navItem = (v: View, icon: string, label: string) => (
    <div
      className={`nav-item ${currentView === v ? 'active' : ''}`}
      onClick={() => onNavigate(v)}
    >
      <i className={`ti ${icon}`} /> {label}
    </div>
  )

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon"><i className="ti ti-shopping-bag" /></div>
        <div className="logo-text">Retail<span>OS</span></div>
      </div>
      <nav className="nav">
        <div className="nav-label">Main</div>
        {navItem('dashboard', 'ti-layout-dashboard', 'Dashboard')}
        {navItem('pos', 'ti-receipt', 'Point of Sale')}
        <div className="nav-label">Management</div>
        {navItem('inventory', 'ti-box', 'Inventory')}
        {navItem('expenses', 'ti-file-invoice', 'Expenses')}
        {navItem('reports', 'ti-chart-bar', 'Reports')}
      </nav>
      <div className="sidebar-footer">
        <div className="avatar">AD</div>
        <div className="avatar-info">
          <p>Admin</p>
          <span>Store Manager</span>
        </div>
      </div>
    </div>
  )
}
