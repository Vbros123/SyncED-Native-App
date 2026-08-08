import { clearStore, getAllRecords, getRecord, putActivityWithQueue, putRecord } from './db.js'

export const ACTIVITY_EVENT = 'synced:activity-changed'
export const QUEUE_EVENT = 'synced:queue-changed'

function notifyActivityChanged() {
  window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT))
  window.dispatchEvent(new CustomEvent(QUEUE_EVENT))
}

export function createActivity(input) {
  const timestamp = input.timestamp || new Date().toISOString()
  return {
    id: input.id || crypto.randomUUID(),
    activityType: input.activityType,
    courseId: input.courseId || null,
    lessonId: input.lessonId || null,
    lessonCompletion: Boolean(input.lessonCompletion),
    quizResponses: input.quizResponses || null,
    quizScore: input.quizScore ?? null,
    assignmentResponses: input.assignmentResponses || null,
    timeCompleted: input.timeCompleted || timestamp,
    progressPercentage: input.progressPercentage ?? 0,
    pointsEarned: input.pointsEarned ?? 0,
    syncStatus: input.syncStatus || 'pending',
    timestamp,
    metadata: input.metadata || {},
  }
}

export async function saveActivity(input, queueDetails = {}) {
  const activity = createActivity(input)
  const existing = await getRecord('activities', activity.id)
  if (existing?.syncStatus === 'synced') return existing

  const queueItem = {
    id: activity.id,
    activityId: activity.id,
    label: queueDetails.label || activity.activityType,
    type: queueDetails.type || 'Learning activity',
    status: 'pending',
    attempts: existing?.attempts || 0,
    createdAt: activity.timestamp,
    updatedAt: activity.timestamp,
    nextAttemptAt: Date.now(),
    lastError: null,
    forceFailureOnce: Boolean(queueDetails.forceFailureOnce),
  }
  await putActivityWithQueue(activity, queueItem)
  notifyActivityChanged()
  return activity
}

export async function getActivities() {
  return (await getAllRecords('activities')).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

export async function markActivityStatus(activityId, syncStatus, details = {}) {
  const activity = await getRecord('activities', activityId)
  if (!activity) return
  await putRecord('activities', { ...activity, syncStatus, ...details })
  notifyActivityChanged()
}

export async function clearActivityData() {
  await clearStore('activities')
  await clearStore('syncQueue')
  notifyActivityChanged()
}

export function activityStatePatch(activities) {
  const courseProgress = {}
  const completedAssignments = []
  const assignmentResponses = {}
  const lateAssignments = []
  const completedSkills = []
  const quizResults = {}
  let familyActivityDone = false
  let earnedPoints = 0

  activities.forEach((activity) => {
    earnedPoints += activity.pointsEarned || 0
    if (activity.activityType === 'quiz-attempt' && activity.courseId && Number.isInteger(activity.metadata?.lessonIndex)) {
      const lessonIndex = activity.metadata.lessonIndex
      quizResults[activity.courseId] ||= {}
      const current = quizResults[activity.courseId][lessonIndex] || {}
      const attemptNumber = activity.metadata.attemptNumber || 1
      const correct = Boolean(activity.metadata.correct)
      quizResults[activity.courseId][lessonIndex] = {
        ...current,
        attempts: Math.max(current.attempts || 0, attemptNumber),
        firstAttemptCorrect: current.firstAttemptCorrect ?? (attemptNumber === 1 ? correct : false),
        completed: current.completed || false,
        lastResponse: activity.quizResponses?.selected ?? current.lastResponse,
        score: current.score ?? null,
      }
    }
    if (activity.activityType === 'quiz' && activity.courseId && Number.isInteger(activity.metadata?.lessonIndex)) {
      const lessonIndex = activity.metadata.lessonIndex
      courseProgress[activity.courseId] ||= []
      if (!courseProgress[activity.courseId].includes(lessonIndex)) courseProgress[activity.courseId].push(lessonIndex)
      quizResults[activity.courseId] ||= {}
      const current = quizResults[activity.courseId][lessonIndex] || {}
      quizResults[activity.courseId][lessonIndex] = {
        ...current,
        attempts: activity.metadata?.attempts || current.attempts || 1,
        firstAttemptCorrect: activity.metadata?.firstAttemptCorrect ?? (activity.quizScore === 100),
        completed: true,
        lastResponse: activity.quizResponses?.selected ?? current.lastResponse,
        score: activity.quizScore ?? current.score ?? 100,
      }
    }
    if (activity.activityType === 'assignment') {
      const id = activity.metadata?.assignmentId
      if (id !== undefined && !completedAssignments.includes(id)) completedAssignments.push(id)
      if (id !== undefined) assignmentResponses[id] = activity.assignmentResponses || ''
      if (activity.metadata?.isLate && !lateAssignments.includes(id)) lateAssignments.push(id)
    }
    if (activity.activityType === 'skill' && activity.metadata?.skillId && !completedSkills.includes(activity.metadata.skillId)) completedSkills.push(activity.metadata.skillId)
    if (activity.activityType === 'family') familyActivityDone = true
  })

  return { courseProgress, quizResults, completedAssignments, assignmentResponses, lateAssignments, completedSkills, familyActivityDone, earnedPoints }
}
