export function assignmentDates(assignment, reference = new Date()) {
  const start = new Date(reference)
  start.setHours(0, 0, 0, 0)
  const due = new Date(start)
  due.setDate(due.getDate() + assignment.dueOffsetDays)
  due.setHours(assignment.dueHour, 0, 0, 0)
  const closes = new Date(start)
  closes.setDate(closes.getDate() + assignment.closeOffsetDays)
  closes.setHours(23, 59, 59, 999)
  return { due, closes }
}

export function assignmentStatus(assignment, completed, reference = new Date()) {
  if (completed) return 'completed'
  const { due, closes } = assignmentDates(assignment, reference)
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
