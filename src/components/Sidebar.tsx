
import { getTranslations, type Language } from '../i18n'

type SidebarProps = {
  activePage: string
  onNavigate: (page: string) => void
  language: Language
}

function Sidebar({
  activePage,
  onNavigate,
  language,
}: SidebarProps) {
  const t = getTranslations(language)

  const navigation = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: '📊',
    },
    {
      id: 'employees',
      label: t.employees,
      icon: '👥',
    },
    {
      id: 'schedule',
      label: t.schedule,
      icon: '📅',
    },
    {
      id: 'settings',
      label: t.settings,
      icon: '⚙️',
    },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">S</div>

        <div className="brand-text">
          <strong>Smart Staff</strong>
          <span>Scheduler</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <p className="nav-label">{t.overview}</p>

        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${
              activePage === item.id ? 'active' : ''
            }`}
            onClick={() => onNavigate(item.id)}
            aria-current={
              activePage === item.id ? 'page' : undefined
            }
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-status-dot" />
        <span>{t.developmentVersion}</span>
      </div>
    </aside>
  )
}

export default Sidebar
