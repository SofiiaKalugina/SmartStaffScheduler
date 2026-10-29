
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Employees, { type Employee } from './components/Employees'
import './App.css'

const initialEmployees: Employee[] = [
  { id: 1, name: 'Anna Kowalska', role: 'Waiter' },
  { id: 2, name: 'Mark Nowak', role: 'Bartender' },
  { id: 3, name: 'Sofia Wiśniewska', role: 'Manager' },
]

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)

  function addEmployee(name: string, role: string) {
    const newEmployee: Employee = {
      id: Date.now(),
      name,
      role,
    }

    setEmployees((currentEmployees) => [
      ...currentEmployees,
      newEmployee,
    ])
  }

  function editEmployee(id: number, name: string, role: string) {
    setEmployees((currentEmployees) =>
      currentEmployees.map((employee) =>
        employee.id === id
          ? { ...employee, name, role }
          : employee
      )
    )
  }

  function deleteEmployee(id: number) {
    setEmployees((currentEmployees) =>
      currentEmployees.filter((employee) => employee.id !== id)
    )
  }

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      icon: '👥',
    },
    {
      title: 'Shifts This Week',
      value: 0,
      icon: '📅',
    },
    {
      title: 'Scheduled Hours',
      value: '0h',
      icon: '⏱',
    },
    {
      title: 'Open Shifts',
      value: 0,
      icon: '📋',
    },
  ]

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div className="app">
        <header className="header">
          <div>
            <p className="eyebrow">
              RESTAURANT WORKFORCE MANAGEMENT
            </p>

            <h1>Smart Staff Scheduler</h1>

            <p className="subtitle">
              Plan shifts, manage your team, and simplify scheduling.
            </p>
          </div>

          <span className="status">Development version</span>
        </header>

        <main>
          {activePage === 'dashboard' && (
            <>
              <section className="welcome">
                <h2>Welcome to your dashboard</h2>
                <p>
                  Here's an overview of your restaurant workforce.
                </p>
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
                  <h2>Team members</h2>

                  <button onClick={() => setActivePage('employees')}>
                    View all employees
                  </button>
                </div>

                <div className="employee-list">
                  {employees.slice(0, 3).map((employee) => (
                    <div className="employee-card" key={employee.id}>
                      <span className="avatar">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>

                      <span>{employee.name}</span>

                      <span className="employee-role">
                        {employee.role}
                      </span>
                    </div>
                  ))}

                  {employees.length === 0 && (
                    <p>No employees yet.</p>
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
            />
          )}

          {activePage === 'schedule' && (
            <section className="welcome">
              <h2>Schedule</h2>
              <p>
                Your weekly shift calendar will appear here.
              </p>
            </section>
          )}

          {activePage === 'settings' && (
            <section className="welcome">
              <h2>Settings</h2>
              <p>
                Restaurant settings will appear here.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
