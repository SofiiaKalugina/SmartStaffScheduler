
type SidebarProps = {
  activePage: string
  onNavigate: (page: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'employees', label: 'Employees', icon: '♙' },
  { id: 'schedule', label: 'Schedule', icon: '▤' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">S</span>
        <span>Smart Staff</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              activePage === item.id ? 'active' : ''
            }`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        Smart Staff Scheduler v0.1
      </div>
    </aside>
  )
}

export default Sidebar
