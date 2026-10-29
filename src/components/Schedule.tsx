
import { useState, type FormEvent } from 'react'
import type {
  Employee,
  EmployeeAvailability,
} from './Employees'
import { getTranslations, type Language } from '../i18n'

export type Shift = {
  id: number
  employeeId: number
  date: string
  startTime: string
  endTime: string
}

type ScheduleProps = {
  employees: Employee[]
  shifts: Shift[]
  onAddShift: (shift: Omit<Shift, 'id'>) => boolean
  onEditShift: (shift: Shift) => boolean
  onDeleteShift: (id: number) => void
  language: Language
}

const scheduleTranslations = {
  en: {
    addShift: 'Add shift',
    editShift: 'Edit shift',
    createShift: 'Create a new shift',
    employee: 'Employee',
    selectEmployee: 'Select employee',
    date: 'Date',
    startTime: 'Start time',
    endTime: 'End time',
    saveShift: 'Save shift',
    saveChanges: 'Save changes',
    previous: 'Previous',
    today: 'Today',
    next: 'Next',
    noShifts: 'No shifts',
    missingFields: 'Please select an employee and a date.',
    invalidTime: 'End time must be later than start time.',
    conflict: 'This employee already has a shift during these hours.',
    deleteConfirmation: 'Delete this shift?',
    unknownEmployee: 'Unknown employee',
    weeklySchedule: "Manage your team's weekly working schedule.",
    noEmployees: 'Add an employee before creating a shift.',
    unavailableDay: 'This employee is not available on the selected day.',
    unavailableHours: 'This shift is outside the employee’s available working hours.',
  },
  pl: {
    addShift: 'Dodaj zmianę',
    editShift: 'Edytuj zmianę',
    createShift: 'Utwórz nową zmianę',
    employee: 'Pracownik',
    selectEmployee: 'Wybierz pracownika',
    date: 'Data',
    startTime: 'Godzina rozpoczęcia',
    endTime: 'Godzina zakończenia',
    saveShift: 'Zapisz zmianę',
    saveChanges: 'Zapisz zmiany',
    previous: 'Poprzedni',
    today: 'Dzisiaj',
    next: 'Następny',
    noShifts: 'Brak zmian',
    missingFields: 'Wybierz pracownika i datę.',
    invalidTime: 'Godzina zakończenia musi być późniejsza niż rozpoczęcia.',
    conflict: 'Ten pracownik ma już zmianę w tych godzinach.',
    deleteConfirmation: 'Usunąć tę zmianę?',
    unknownEmployee: 'Nieznany pracownik',
    weeklySchedule: 'Zarządzaj tygodniowym grafikiem zespołu.',
    noEmployees: 'Dodaj pracownika przed utworzeniem zmiany.',
    unavailableDay: 'Ten pracownik jest niedostępny w wybranym dniu.',
    unavailableHours: 'Zmiana wykracza poza dostępne godziny pracy pracownika.',
  },
  uk: {
    addShift: 'Додати зміну',
    editShift: 'Редагувати зміну',
    createShift: 'Створити нову зміну',
    employee: 'Працівник',
    selectEmployee: 'Виберіть працівника',
    date: 'Дата',
    startTime: 'Час початку',
    endTime: 'Час завершення',
    saveShift: 'Зберегти зміну',
    saveChanges: 'Зберегти зміни',
    previous: 'Попередній',
    today: 'Сьогодні',
    next: 'Наступний',
    noShifts: 'Немає змін',
    missingFields: 'Виберіть працівника та дату.',
    invalidTime: 'Час завершення має бути пізнішим за час початку.',
    conflict: 'Цей працівник уже має зміну в цей час.',
    deleteConfirmation: 'Видалити цю зміну?',
    unknownEmployee: 'Невідомий працівник',
    weeklySchedule: 'Керуйте тижневим графіком команди.',
    noEmployees: 'Додайте працівника перед створенням зміни.',
    unavailableDay: 'Цей працівник недоступний у вибраний день.',
    unavailableHours: 'Зміна виходить за межі доступного робочого часу працівника.',
  },
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getMonday(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()

  result.setDate(result.getDate() - ((day + 6) % 7))
  result.setHours(0, 0, 0, 0)

  return result
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

    return parsed as EmployeeAvailability
  } catch {
    return {}
  }
}

function getAvailabilityError(
  employeeId: number,
  date: string,
  startTime: string,
  endTime: string,
  availability: EmployeeAvailability,
  messages: typeof scheduleTranslations.en
): string | null {
  const employeeAvailability = availability[employeeId]

  // Employees without saved availability have no restrictions.
  if (!employeeAvailability) return null

  const selectedDate = new Date(`${date}T12:00:00`)

  if (Number.isNaN(selectedDate.getTime())) return null

  // JavaScript: Sunday = 0, Monday = 1.
  // Availability: Monday = 0, Sunday = 6.
  const dayIndex = (selectedDate.getDay() + 6) % 7
  const dayAvailability = employeeAvailability[dayIndex]

  if (!dayAvailability) return null

  if (!dayAvailability.available) {
    return messages.unavailableDay
  }

  if (
    startTime < dayAvailability.startTime ||
    endTime > dayAvailability.endTime
  ) {
    return messages.unavailableHours
  }

  return null
}

function Schedule({
  employees,
  shifts,
  onAddShift,
  onEditShift,
  onDeleteShift,
  language,
}: ScheduleProps) {
  const t = getTranslations(language)
  const s = scheduleTranslations[language]

  const [currentWeek, setCurrentWeek] = useState(() =>
    getMonday(new Date())
  )
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [employeeId, setEmployeeId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [error, setError] = useState('')

  const locale =
    language === 'pl' ? 'pl-PL' :
    language === 'uk' ? 'uk-UA' :
    'en-GB'

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(currentWeek)
    day.setDate(currentWeek.getDate() + index)
    return day
  })

  const weekEnd = weekDays[6]

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  })

  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
  })

  function changeWeek(offset: number) {
    setCurrentWeek((previousWeek) => {
      const nextWeek = new Date(previousWeek)
      nextWeek.setDate(nextWeek.getDate() + offset * 7)
      return nextWeek
    })
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setEmployeeId('')
    setDate('')
    setStartTime('09:00')
    setEndTime('17:00')
    setError('')
  }

  function startAdding() {
    if (showForm && editingId === null) {
      resetForm()
      return
    }

    resetForm()
    setDate(formatDate(new Date()))
    setShowForm(true)
  }

  function startEditing(shift: Shift) {
    setEditingId(shift.id)
    setEmployeeId(String(shift.employeeId))
    setDate(shift.date)
    setStartTime(shift.startTime)
    setEndTime(shift.endTime)
    setError('')
    setShowForm(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!employeeId || !date) {
      setError(s.missingFields)
      return
    }

    const selectedEmployeeId = Number(employeeId)

    if (!employees.some((person) => person.id === selectedEmployeeId)) {
      setError(s.selectEmployee)
      return
    }

    if (endTime <= startTime) {
      setError(s.invalidTime)
      return
    }

    // Read the latest saved availability before validating.
    const availability = loadAvailability()

    const availabilityError = getAvailabilityError(
      selectedEmployeeId,
      date,
      startTime,
      endTime,
      availability,
      s
    )

    if (availabilityError) {
      setError(availabilityError)
      return
    }

    const shiftData = {
      employeeId: selectedEmployeeId,
      date,
      startTime,
      endTime,
    }

    const saved =
      editingId !== null
        ? onEditShift({ id: editingId, ...shiftData })
        : onAddShift(shiftData)

    if (!saved) {
      setError(s.conflict)
      return
    }

    setCurrentWeek(getMonday(new Date(`${date}T12:00:00`)))
    resetForm()
  }

  function handleDelete(shift: Shift) {
    const employee = employees.find(
      (person) => person.id === shift.employeeId
    )

    const confirmed = window.confirm(
      `${s.deleteConfirmation}\n\n${
        employee?.name ?? s.unknownEmployee
      }\n${shift.date}: ${shift.startTime} – ${shift.endTime}`
    )

    if (!confirmed) return

    onDeleteShift(shift.id)

    if (editingId === shift.id) {
      resetForm()
    }
  }

  return (
    <section className="schedule-page">
      <div className="section-header">
        <div>
          <h2>{t.schedule}</h2>
          <p>{s.weeklySchedule}</p>
        </div>

        <button
          type="button"
          onClick={startAdding}
          disabled={employees.length === 0}
        >
          {showForm && editingId === null
            ? t.cancel
            : `+ ${s.addShift}`}
        </button>
      </div>

      {employees.length === 0 && (
        <p className="empty-state">{s.noEmployees}</p>
      )}

      {showForm && (
        <form className="employee-form" onSubmit={handleSubmit}>
          <h3>
            {editingId !== null ? s.editShift : s.createShift}
          </h3>

          <label htmlFor="shift-employee">{s.employee}</label>

          <select
            id="shift-employee"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            required
          >
            <option value="">{s.selectEmployee}</option>

            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>

          <label htmlFor="shift-date">{s.date}</label>

          <input
            id="shift-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />

          <label htmlFor="shift-start">{s.startTime}</label>

          <input
            id="shift-start"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
          />

          <label htmlFor="shift-end">{s.endTime}</label>

          <input
            id="shift-end"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            required
          />

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button type="submit">
              {editingId !== null
                ? s.saveChanges
                : s.saveShift}
            </button>

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

      <div className="calendar-container">
        <div className="calendar-toolbar">
          <div>
            <h3>
              {dateFormatter.format(currentWeek)}
              {' – '}
              {dateFormatter.format(weekEnd)}
            </h3>
            <p>{currentWeek.getFullYear()}</p>
          </div>

          <div className="calendar-navigation">
            <button
              type="button"
              onClick={() => changeWeek(-1)}
            >
              ← {s.previous}
            </button>

            <button
              type="button"
              onClick={() => setCurrentWeek(getMonday(new Date()))}
            >
              {s.today}
            </button>

            <button
              type="button"
              onClick={() => changeWeek(1)}
            >
              {s.next} →
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {weekDays.map((day) => {
            const dateString = formatDate(day)

            const dayShifts = shifts
              .filter((shift) => shift.date === dateString)
              .sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
              )

            const isToday =
              dateString === formatDate(new Date())

            return (
              <div className="calendar-day" key={dateString}>
                <div
                  className={`calendar-day-header ${
                    isToday ? 'today' : ''
                  }`}
                >
                  <span>{weekdayFormatter.format(day)}</span>
                  <strong>{day.getDate()}</strong>
                </div>

                <div className="calendar-day-content">
                  {dayShifts.length === 0 ? (
                    <p className="no-shifts">{s.noShifts}</p>
                  ) : (
                    dayShifts.map((shift) => {
                      const employee = employees.find(
                        (person) =>
                          person.id === shift.employeeId
                      )

                      return (
                        <div
                          className="calendar-shift"
                          key={shift.id}
                        >
                          <strong>
                            {employee?.name ??
                              s.unknownEmployee}
                          </strong>

                          <span>
                            {shift.startTime} – {shift.endTime}
                          </span>

                          <div className="shift-actions">
                            <button
                              type="button"
                              onClick={() => startEditing(shift)}
                            >
                              {t.edit}
                            </button>

                            <button
                              type="button"
                              className="shift-delete"
                              onClick={() => handleDelete(shift)}
                            >
                              {t.delete}
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Schedule
