
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

export type AvailabilityDay = {
  available: boolean
  startTime: string
  endTime: string
}

export type EmployeeAvailability = Record<number, AvailabilityDay[]>

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

const availabilityText = {
  en: {
    availability: 'Availability',
    manage: 'Manage availability',
    description: 'Set the days and hours this employee can work.',
    available: 'Available',
    unavailable: 'Not available',
    start: 'Start',
    end: 'End',
    save: 'Save availability',
    saved: 'Availability saved successfully.',
    invalid: 'End time must be later than start time.',
    notSet: 'Availability not set',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  pl: {
    availability: 'Dostępność',
    manage: 'Zarządzaj dostępnością',
    description: 'Ustaw dni i godziny, w których pracownik może pracować.',
    available: 'Dostępny',
    unavailable: 'Niedostępny',
    start: 'Od',
    end: 'Do',
    save: 'Zapisz dostępność',
    saved: 'Dostępność została zapisana.',
    invalid: 'Godzina zakończenia musi być późniejsza niż rozpoczęcia.',
    notSet: 'Nie ustawiono dostępności',
    days: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'],
  },
  uk: {
    availability: 'Доступність',
    manage: 'Керувати доступністю',
    description: 'Вкажіть дні та години, коли працівник може працювати.',
    available: 'Доступний',
    unavailable: 'Недоступний',
    start: 'Початок',
    end: 'Кінець',
    save: 'Зберегти доступність',
    saved: 'Доступність успішно збережено.',
    invalid: 'Час завершення має бути пізнішим за час початку.',
    notSet: 'Доступність не налаштована',
    days: ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота', 'Неділя'],
  },
}

function defaultAvailability(): AvailabilityDay[] {
  return Array.from({ length: 7 }, () => ({
    available: true,
    startTime: '09:00',
    endTime: '17:00',
  }))
}

function loadAvailability(): EmployeeAvailability {
  try {
    const saved = localStorage.getItem('smartstaff-availability')
    if (!saved) return {}

    const parsed: unknown = JSON.parse(saved)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {}
    }

    const result: EmployeeAvailability = {}

    for (const [id, value] of Object.entries(parsed)) {
      if (!Array.isArray(value) || value.length !== 7) continue

      const valid = value.every(
        (day) =>
          typeof day === 'object' &&
          day !== null &&
          typeof day.available === 'boolean' &&
          typeof day.startTime === 'string' &&
          typeof day.endTime === 'string'
      )

      if (valid) {
        result[Number(id)] = value as AvailabilityDay[]
      }
    }

    return result
  } catch {
    return {}
  }
}

function Employees({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  language,
}: EmployeesProps) {
  const t = getTranslations(language)
  const a = availabilityText[language]

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('Waiter')

  const [availability, setAvailability] =
    useState<EmployeeAvailability>(loadAvailability)

  const [availabilityEmployeeId, setAvailabilityEmployeeId] =
    useState<number | null>(null)

  const [availabilityDays, setAvailabilityDays] =
    useState<AvailabilityDay[]>(defaultAvailability)

  const [availabilityError, setAvailabilityError] = useState('')
  const [availabilitySuccess, setAvailabilitySuccess] = useState('')

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

    const updated = { ...availability }
    delete updated[employee.id]

    setAvailability(updated)
    localStorage.setItem(
      'smartstaff-availability',
      JSON.stringify(updated)
    )

    if (editingId === employee.id) resetForm()

    if (availabilityEmployeeId === employee.id) {
      setAvailabilityEmployeeId(null)
    }
  }

  function openAvailability(employee: Employee) {
    if (availabilityEmployeeId === employee.id) {
      setAvailabilityEmployeeId(null)
      return
    }

    const existing = availability[employee.id]

    setAvailabilityDays(
      existing
        ? existing.map((day) => ({ ...day }))
        : defaultAvailability()
    )

    setAvailabilityEmployeeId(employee.id)
    setAvailabilityError('')
    setAvailabilitySuccess('')
    setShowForm(false)
  }

  function updateAvailabilityDay(
    index: number,
    changes: Partial<AvailabilityDay>
  ) {
    setAvailabilityDays((previous) =>
      previous.map((day, dayIndex) =>
        dayIndex === index ? { ...day, ...changes } : day
      )
    )

    setAvailabilityError('')
    setAvailabilitySuccess('')
  }

  function saveAvailability() {
    if (availabilityEmployeeId === null) return

    const invalid = availabilityDays.some(
      (day) =>
        day.available &&
        day.endTime <= day.startTime
    )

    if (invalid) {
      setAvailabilityError(a.invalid)
      return
    }

    const updated = {
      ...availability,
      [availabilityEmployeeId]: availabilityDays.map(
        (day) => ({ ...day })
      ),
    }

    setAvailability(updated)

    localStorage.setItem(
      'smartstaff-availability',
      JSON.stringify(updated)
    )

    setAvailabilityError('')
    setAvailabilitySuccess(a.saved)
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
            <div key={employee.id}>
              <div className="employee-card">
                <span className="avatar">
                  {employee.name.charAt(0).toUpperCase()}
                </span>

                <div className="employee-info">
                  <strong>{employee.name}</strong>
                  <span className="employee-role">
                    {roleLabel(employee.role, language)}
                  </span>

                  <span className="availability-status">
                    {availability[employee.id]
                      ? `✓ ${a.availability}`
                      : a.notSet}
                  </span>
                </div>

                <div className="employee-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => openAvailability(employee)}
                  >
                    {a.availability}
                  </button>

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

              {availabilityEmployeeId === employee.id && (
                <div className="availability-panel">
                  <div className="availability-heading">
                    <h3>{a.manage}</h3>
                    <p>{a.description}</p>
                  </div>

                  <div className="availability-days">
                    {availabilityDays.map((day, index) => (
                      <div
                        className="availability-day"
                        key={index}
                      >
                        <strong className="availability-day-name">
                          {a.days[index]}
                        </strong>

                        <label className="availability-checkbox">
                          <input
                            type="checkbox"
                            checked={day.available}
                            onChange={(event) =>
                              updateAvailabilityDay(index, {
                                available: event.target.checked,
                              })
                            }
                          />
                          <span>
                            {day.available
                              ? a.available
                              : a.unavailable}
                          </span>
                        </label>

                        {day.available && (
                          <div className="availability-time-fields">
                            <label>
                              {a.start}
                              <input
                                type="time"
                                value={day.startTime}
                                onChange={(event) =>
                                  updateAvailabilityDay(index, {
                                    startTime: event.target.value,
                                  })
                                }
                              />
                            </label>

                            <label>
                              {a.end}
                              <input
                                type="time"
                                value={day.endTime}
                                onChange={(event) =>
                                  updateAvailabilityDay(index, {
                                    endTime: event.target.value,
                                  })
                                }
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {availabilityError && (
                    <p className="form-error" role="alert">
                      {availabilityError}
                    </p>
                  )}

                  {availabilitySuccess && (
                    <p className="availability-success" role="status">
                      {availabilitySuccess}
                    </p>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={saveAvailability}
                    >
                      {a.save}
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        setAvailabilityEmployeeId(null)
                      }
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default Employees
