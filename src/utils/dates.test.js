import { describe, expect, it } from 'vitest'
import { assignmentDates, assignmentStatus } from './dates.js'

const assignment = {
  dueAt: '2026-09-21T23:00:00Z',
  closesAt: '2026-09-22T23:59:59.999Z',
}

describe('fixed assignment deadlines', () => {
  it('keeps the same deadline as the current day changes', () => {
    expect(assignmentDates(assignment).due.toISOString()).toBe('2026-09-21T23:00:00.000Z')
    expect(assignmentStatus(assignment, false, new Date('2026-09-20T00:00:00Z'))).toBe('todo')
    expect(assignmentStatus(assignment, false, new Date('2026-09-21T12:00:00Z'))).toBe('due')
    expect(assignmentStatus(assignment, false, new Date('2026-09-22T12:00:00Z'))).toBe('late')
    expect(assignmentStatus(assignment, false, new Date('2026-09-23T00:00:00Z'))).toBe('closed')
  })

  it('enforces the precise due and closing boundaries', () => {
    expect(assignmentStatus(assignment, false, new Date(assignment.dueAt))).toBe('due')
    expect(assignmentStatus(assignment, false, new Date('2026-09-21T23:00:00.001Z'))).toBe('late')
    expect(assignmentStatus(assignment, false, new Date(assignment.closesAt))).toBe('late')
    expect(assignmentStatus(assignment, false, new Date('2026-09-23T00:00:00Z'))).toBe('closed')
  })

  it('compares instants consistently across timezone offsets', () => {
    expect(assignmentStatus(assignment, false, new Date('2026-09-21T19:00:00-04:00'))).toBe('due')
    expect(assignmentStatus(assignment, false, new Date('2026-09-22T08:00:00+09:00'))).toBe('due')
  })

  it('keeps completed work viewable after closing', () => {
    expect(assignmentStatus(assignment, true, new Date('2027-01-01T00:00:00Z'))).toBe('completed')
  })
})
