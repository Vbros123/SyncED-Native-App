function hashText(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(-7)
}

export function createCompletionRecord({ kind, courseId, courseTitle, lessonTitle, points, completedAt = new Date().toISOString() }) {
  const fingerprint = [kind, courseId, lessonTitle, points, completedAt].join('|')
  return {
    kind,
    courseId,
    courseTitle,
    lessonTitle,
    points,
    completedAt,
    code: `SE-${hashText(fingerprint)}`,
    student: 'Maya J.',
  }
}
