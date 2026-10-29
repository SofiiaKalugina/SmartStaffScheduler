
import { useState } from 'react'
import './App.css'

function App() {
  const [employees, setEmployees] = useState([
    'Anna Kowalska',
    'Mark Nowak',
    'Sofia Wiśniewska',
  ])

  function addEmployee() {
    const newEmployee = `Employee ${employees.length + 1}`
    setEmployees([...employees, newEmployee])
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">RESTAURANT WORKFORCE MANAGEMENT</p>
          <h1>Smart Staff Scheduler</h1>
          <p className="subtitle">
            Plan shifts, manage your team, and simplify scheduling.
          </p>
        </div>
        <span className="status">Development version</span>
      </header>

      <main>
        <section className="welcome">
          <h2>Welcome to your dashboard</h2>
          <p>
            Your restaurant scheduling workspace starts here.
          </p>
        </section>

        <section className="employees">
          <div className="section-header">
            <h2>Team members</h2>
            <button onClick={addEmployee}>
              + Add employee
            </button>
          </div>

          <div className="employee-list">
            {employees.map((employee, index) => (
              <div className="employee-card" key={index}>
                <span className="avatar">
                  {employee.charAt(0)}
                </span>
                <span>{employee}</span>
                <span className="employee-role">Team member</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
