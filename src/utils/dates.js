// Assignment timestamps are fixed instants. Display deadlines in UTC on every device.
export const assignmentTimeZone = 'UTC'

export function assignmentDates(assignment) {
  return { due: new Date(assignment.dueAt), closes: new Date(assignment.closesAt) }
}

export function assignmentStatus(assignment, completed, reference = new Date()) {
  if (completed) return 'completed'
  const { due, closes } = assignmentDates(assignment)
  if (reference > closes) return 'closed'
  if (reference > due) return 'late'
  const hours = (due.getTime() - reference.getTime()) / 3_600_000
  if (hours <= 36) return 'due'
  return 'todo'
}

export function calendarDays(reference = new Date()) {
  const year = reference.getFullYear()
  const month = reference.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const days = []
  for (let index = 0; index < first.getDay(); index += 1) days.push(null)
  for (let day = 1; day <= last.getDate(); day += 1) days.push(new Date(year, month, day))
  while (days.length % 7) days.push(null)
  return days
}
