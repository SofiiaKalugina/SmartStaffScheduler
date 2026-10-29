
import { useState, type FormEvent } from 'react'
import {
  getTranslations,
  roleLabel,
  type Language,
} from '../i18n'

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
  language: Language
}

const availableRoles = [
  'Waiter',
  'Bartender',
  'Manager',
  'Chef',
  'Cook',
  'Kitchen Assistant',
  'Host',
  'Cleaner',
  'Other',
]

function Employees({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  language,
}: EmployeesProps) {
  const t = getTranslations(language)

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('Waiter')

  const filteredEmployees = employees.filter((employee) => {
    const query = search.toLocaleLowerCase()

    return (
      employee.name.toLocaleLowerCase().includes(query) ||
      employee.role.toLocaleLowerCase().includes(query) ||
      roleLabel(employee.role, language)
        .toLocaleLowerCase()
        .includes(query)
    )
  })

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setName('')
    setRole('Waiter')
  }

  function startAdding() {
    resetForm()
    setShowForm(true)
  }

  function startEditing(employee: Employee) {
    setEditingId(employee.id)
    setName(employee.name)
    setRole(employee.role)
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
      `${t.confirmDelete}\n\n${employee.name}`
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
          <h2>{t.employees}</h2>
          <p>{t.manageEmployees}</p>
        </div>

        <button type="button" onClick={startAdding}>
          + {t.addEmployee}
        </button>
      </div>

      {showForm && (
        <form className="employee-form" onSubmit={handleSubmit}>
          <h3>
            {editingId !== null ? t.editEmployee : t.addEmployee}
          </h3>

          <label htmlFor="employee-name">{t.name}</label>

          <input
            id="employee-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
            autoFocus
          />

          <label htmlFor="employee-role">{t.role}</label>

          <select
            id="employee-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {availableRoles.map((availableRole) => (
              <option key={availableRole} value={availableRole}>
                {roleLabel(availableRole, language)}
              </option>
            ))}
          </select>

          <div className="form-actions">
            <button type="submit">{t.save}</button>

            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      <div className="employees-toolbar">
        <input
          type="search"
          className="employee-search"
          placeholder={t.searchEmployees}
          aria-label={t.searchEmployees}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <span className="employee-count">
          {filteredEmployees.length} / {employees.length}
        </span>
      </div>

      <div className="employee-list">
        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <p>{t.noEmployees}</p>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div className="employee-card" key={employee.id}>
              <span className="avatar">
                {employee.name.charAt(0).toUpperCase()}
              </span>

              <div className="employee-info">
                <strong>{employee.name}</strong>
                <span className="employee-role">
                  {roleLabel(employee.role, language)}
                </span>
              </div>

              <div className="employee-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => startEditing(employee)}
                  aria-label={`${t.edit}: ${employee.name}`}
                >
                  {t.edit}
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDelete(employee)}
                  aria-label={`${t.delete}: ${employee.name}`}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default Employees
