
import { useState, type FormEvent } from 'react'

export type Employee = {
  id: number
  name: string
  role: string
}

type EmployeesProps = {
  employees: Employee[]
  onAddEmployee: (name: string, role: string) => void
  onEditEmployee: (id: number, name: string, role: string) => void
  onDeleteEmployee: (id: number) => void
}

const roles = [
  'Waiter',
  'Bartender',
  'Chef',
  'Kitchen Assistant',
  'Manager',
]

function Employees({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
}: EmployeesProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('Waiter')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  function resetForm() {
    setName('')
    setRole('Waiter')
    setEditingId(null)
    setShowForm(false)
  }

  function startAdding() {
    if (showForm && editingId === null) {
      resetForm()
      return
    }

    setName('')
    setRole('Waiter')
    setEditingId(null)
    setShowForm(true)
  }

  function startEditing(employee: Employee) {
    setName(employee.name)
    setRole(employee.role)
    setEditingId(employee.id)
    setShowForm(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) return

    if (editingId !== null) {
      onEditEmployee(editingId, trimmedName, role)
    } else {
      onAddEmployee(trimmedName, role)
    }

    resetForm()
  }

  function handleDelete(employee: Employee) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`
    )

    if (!confirmed) return

    onDeleteEmployee(employee.id)

    if (editingId === employee.id) {
      resetForm()
    }
  }

  return (
    <section className="employees-page">
      <div className="section-header">
        <div>
          <h2>Employees</h2>
          <p>Manage your restaurant team members.</p>
        </div>

        <button onClick={startAdding}>
          {showForm && editingId === null
            ? 'Cancel'
            : '+ Add employee'}
        </button>
      </div>

      {showForm && (
        <form className="employee-form" onSubmit={handleSubmit}>
          <h3>
            {editingId !== null ? 'Edit employee' : 'Add employee'}
          </h3>

          <label htmlFor="employee-name">Full name</label>
          <input
            id="employee-name"
            type="text"
            placeholder="e.g. Anna Kowalska"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label htmlFor="employee-role">Role</label>
          <select
            id="employee-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {roles.map((availableRole) => (
              <option key={availableRole} value={availableRole}>
                {availableRole}
              </option>
            ))}
          </select>

          <div className="form-actions">
            <button type="submit">
              {editingId !== null
                ? 'Save changes'
                : 'Save employee'}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="employee-list">
        {employees.length === 0 && (
          <p>No employees yet. Add your first team member.</p>
        )}

        {employees.map((employee) => (
          <div className="employee-card" key={employee.id}>
            <span className="avatar">
              {employee.name.charAt(0).toUpperCase()}
            </span>

            <span>{employee.name}</span>

            <span className="employee-role">
              {employee.role}
            </span>

            <div className="employee-actions">
              <button
                className="secondary-button"
                onClick={() => startEditing(employee)}
              >
                Edit
              </button>

              <button
                className="delete-button"
                onClick={() => handleDelete(employee)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Employees
