
import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Employees, { type Employee } from './components/Employees'
import Schedule, { type Shift } from './components/Schedule'
import {
  getTranslations,
  roleLabel,
  type Language,
  type Theme,
} from './i18n'
import './App.css'

const initialEmployees: Employee[] = [
  { id: 1, name: 'Anna Kowalska', role: 'Waiter' },
  { id: 2, name: 'Mark Nowak', role: 'Bartender' },
  { id: 3, name: 'Sofia Wiśniewska', role: 'Manager' },
]

function loadEmployees(): Employee[] {
  try {
    const saved = localStorage.getItem('smartstaff-employees')

    if (!saved) return initialEmployees

    const parsed: unknown = JSON.parse(saved)

    if (!Array.isArray(parsed)) return initialEmployees

    return parsed.filter(
      (employee): employee is Employee =>
        typeof employee === 'object' &&
        employee !== null &&
        typeof employee.id === 'number' &&
        typeof employee.name === 'string' &&
        typeof employee.role === 'string'
    )
  } catch {
    return initialEmployees
  }
}

function loadShifts(): Shift[] {
  try {
    const saved = localStorage.getItem('smartstaff-shifts')

    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (shift): shift is Shift =>
        typeof shift === 'object' &&
        shift !== null &&
        typeof shift.id === 'number' &&
        typeof shift.employeeId === 'number' &&
        typeof shift.date === 'string' &&
        typeof shift.startTime === 'string' &&
        typeof shift.endTime === 'string'
    )
  } catch {
    return []
  }
}

function loadLanguage(): Language {
  const saved = localStorage.getItem('smartstaff-language')

  if (saved === 'en' || saved === 'pl' || saved === 'uk') {
    return saved
  }

  return 'en'
}

function loadTheme(): Theme {
  return localStorage.getItem('smartstaff-theme') === 'dark'
    ? 'dark'
    : 'light'
}

function getWeekStart(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()

  result.setDate(result.getDate() - ((day + 6) % 7))
  result.setHours(0, 0, 0, 0)

  return result
}

function getShiftHours(shift: Shift): number {
  const [startHour, startMinute] = shift.startTime.split(':').map(Number)
  const [endHour, endMinute] = shift.endTime.split(':').map(Number)

  return (
    (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60
  )
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees)
  const [shifts, setShifts] = useState<Shift[]>(loadShifts)
  const [language, setLanguage] = useState<Language>(loadLanguage)
  const [theme, setTheme] = useState<Theme>(loadTheme)

  const t = getTranslations(language)

  useEffect(() => {
    localStorage.setItem('smartstaff-language', language)
    document.documentElement.lang = language === 'uk' ? 'uk' : language
  }, [language])

  useEffect(() => {
    localStorage.setItem('smartstaff-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function saveEmployees(updatedEmployees: Employee[]) {
    setEmployees(updatedEmployees)
    localStorage.setItem(
      'smartstaff-employees',
      JSON.stringify(updatedEmployees)
    )
  }

  function saveShifts(updatedShifts: Shift[]) {
    setShifts(updatedShifts)
    localStorage.setItem('smartstaff-shifts', JSON.stringify(updatedShifts))
  }

  function addEmployee(name: string, role: string) {
    const newEmployee: Employee = {
      id: Date.now(),
      name: name.trim(),
      role,
    }

    saveEmployees([...employees, newEmployee])
  }

  function editEmployee(id: number, name: string, role: string) {
    saveEmployees(
      employees.map((employee) =>
        employee.id === id
          ? { ...employee, name: name.trim(), role }
          : employee
      )
    )
  }

  function deleteEmployee(id: number) {
    saveEmployees(
      employees.filter((employee) => employee.id !== id)
    )

    saveShifts(
      shifts.filter((shift) => shift.employeeId !== id)
    )
  }

  function hasShiftConflict(
    shiftData: Omit<Shift, 'id'>,
    excludedId?: number
  ): boolean {
    return shifts.some((existingShift) => {
      if (existingShift.id === excludedId) return false

      if (existingShift.employeeId !== shiftData.employeeId) {
        return false
      }

      if (existingShift.date !== shiftData.date) {
        return false
      }

      return (
        shiftData.startTime < existingShift.endTime &&
        shiftData.endTime > existingShift.startTime
      )
    })
  }

  function addShift(shiftData: Omit<Shift, 'id'>) {
    if (hasShiftConflict(shiftData)) {
      return false
    }

    const newShift: Shift = {
      id: Date.now(),
      ...shiftData,
    }

    saveShifts([...shifts, newShift])
    return true
  }

  function editShift(updatedShift: Shift) {
    if (
      hasShiftConflict(
        {
          employeeId: updatedShift.employeeId,
          date: updatedShift.date,
          startTime: updatedShift.startTime,
          endTime: updatedShift.endTime,
        },
        updatedShift.id
      )
    ) {
      return false
    }

    saveShifts(
      shifts.map((shift) =>
        shift.id === updatedShift.id ? updatedShift : shift
      )
    )

    return true
  }

  function deleteShift(id: number) {
    saveShifts(shifts.filter((shift) => shift.id !== id))
  }

  const weekStart = getWeekStart(new Date())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const thisWeekShifts = shifts.filter((shift) => {
    const shiftDate = new Date(`${shift.date}T00:00:00`)
    return shiftDate >= weekStart && shiftDate < weekEnd
  })

  const scheduledHours = thisWeekShifts.reduce(
    (total, shift) => total + getShiftHours(shift),
    0
  )

  const stats = [
    {
      title: t.totalEmployees,
      value: employees.length,
      icon: '👥',
    },
    {
      title: t.shiftsThisWeek,
      value: thisWeekShifts.length,
      icon: '📅',
    },
    {
      title: t.scheduledHours,
      value: `${Number(scheduledHours.toFixed(2))}h`,
      icon: '⏱️',
    },
    {
      title: t.openShifts,
      value: 0,
      icon: '📋',
    },
  ]

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        language={language}
      />

      <div className="app">
        <header className="header">
          <div>
            <p className="eyebrow">
              RESTAURANT WORKFORCE MANAGEMENT
            </p>

            <h1>{t.appName}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>

          <div className="header-controls">
            <select
              className="language-select"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as Language)
              }
              aria-label={t.language}
            >
              <option value="en">🇬🇧 English</option>
              <option value="pl">🇵🇱 Polski</option>
              <option value="uk">🇺🇦 Українська</option>
            </select>

            <button
              className="theme-toggle"
              onClick={() =>
                setTheme(theme === 'light' ? 'dark' : 'light')
              }
              aria-label={t.theme}
            >
              {theme === 'light' ? '🌙' : '☀️'}
              <span>
                {theme === 'light' ? t.dark : t.light}
              </span>
            </button>
          </div>
        </header>

        <main>
          {activePage === 'dashboard' && (
            <>
              <section className="welcome">
                <h2>{t.welcome}</h2>
                <p>{t.welcomeDescription}</p>
              </section>

              <section className="stats-grid">
                {stats.map((stat) => (
                  <div className="stat-card" key={stat.title}>
                    <div className="stat-top">
                      <span className="stat-title">
                        {stat.title}
                      </span>
                      <span className="stat-icon">
                        {stat.icon}
                      </span>
                    </div>

                    <strong className="stat-value">
                      {stat.value}
                    </strong>
                  </div>
                ))}
              </section>

              <section className="employees">
                <div className="section-header">
                  <h2>{t.teamMembers}</h2>

                  <button
                    onClick={() => setActivePage('employees')}
                  >
                    {t.viewAllEmployees}
                  </button>
                </div>

                <div className="employee-list">
                  {employees.slice(0, 3).map((employee) => (
                    <div
                      className="employee-card"
                      key={employee.id}
                    >
                      <span className="avatar">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>

                      <span>{employee.name}</span>

                      <span className="employee-role">
                        {roleLabel(employee.role, language)}
                      </span>
                    </div>
                  ))}

                  {employees.length === 0 && (
                    <p>{t.noEmployees}</p>
                  )}
                </div>
              </section>
            </>
          )}

          {activePage === 'employees' && (
            <Employees
              employees={employees}
              onAddEmployee={addEmployee}
              onEditEmployee={editEmployee}
              onDeleteEmployee={deleteEmployee}
              language={language}
            />
          )}

          {activePage === 'schedule' && (
            <Schedule
              employees={employees}
              shifts={shifts}
              onAddShift={addShift}
              onEditShift={editShift}
              onDeleteShift={deleteShift}
              language={language}
            />
          )}

          {activePage === 'settings' && (
            <section className="settings-page">
              <div className="section-header">
                <div>
                  <h2>{t.settings}</h2>
                  <p>{t.settingsDescription}</p>
                </div>
              </div>

              <div className="settings-card">
                <h3>{t.language}</h3>

                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as Language)
                  }
                >
                  <option value="en">English</option>
                  <option value="pl">Polski</option>
                  <option value="uk">Українська</option>
                </select>
              </div>

              <div className="settings-card">
                <h3>{t.appearance}</h3>

                <div className="theme-options">
                  <button
                    className={
                      theme === 'light' ? 'selected' : ''
                    }
                    onClick={() => setTheme('light')}
                  >
                    ☀️ {t.light}
                  </button>

                  <button
                    className={
                      theme === 'dark' ? 'selected' : ''
                    }
                    onClick={() => setTheme('dark')}
                  >
                    🌙 {t.dark}
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
