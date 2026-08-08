import { courseContent, courses } from '../data.js'
import { clearStore, deleteRecord, getAllRecords, getRecord, putRecord } from './db.js'

export const CONTENT_EVENT = 'synced:downloads-changed'
export const RESILIENT_PACK_ID = 'resilient-learning-pack'

const CONTENT_VERSIONS = Object.fromEntries(courses.map((course) => [course.id, course.version || 1]))

function notifyDownloadsChanged() {
  window.dispatchEvent(new CustomEvent(CONTENT_EVENT))
}

function byteSize(value) {
  return new Blob([JSON.stringify(value)]).size
}

function lessonPackage(courseId) {
  const course = courses.find((item) => item.id === courseId)
  const content = courseContent[courseId]
  if (!course || !content) throw new Error('Lesson content is unavailable.')

  const base = {
    id: course.id,
    kind: 'lesson',
    title: course.title,
    subject: course.subject,
    description: course.description,
    textContent: content.videoSlides.map(([heading, body], index) => ({ id: `${course.id}-text-${index + 1}`, heading, body })),
    diagrams: [{
      id: `${course.id}-concept-diagram`,
      type: 'step-diagram',
      alt: `${course.title} concept diagram`,
      panels: content.videoSlides.map(([heading, body], index) => ({ step: index + 1, heading, caption: body })),
    }],
    quizQuestions: content.questions.map((question, index) => ({ id: `${course.id}-quiz-${index + 1}`, ...question })),
    worksheetData: {
      title: `${course.title} worksheet`,
      instructions: 'Complete each question and explain one answer in your own words.',
      questions: content.questions.map(({ title, prompt, options }, index) => ({ number: index + 1, title, prompt, options, responseType: 'choice-and-explanation' })),
    },
    estimatedFileSize: course.size,
    version: CONTENT_VERSIONS[course.id],
    sourceUpdatedAt: course.updatedAt || '2026-08-06T00:00:00.000Z',
  }
  const withSize = { ...base, byteSize: byteSize(base) }
  return { ...withSize, byteSize: byteSize(withSize) }
}

function resilientPackPackage() {
  const coreIds = ['algebra', 'science', 'reading']
  const lessons = coreIds.map((id) => {
    const lesson = lessonPackage(id)
    return {
      id: lesson.id,
      title: lesson.title,
      subject: lesson.subject,
      textContent: lesson.textContent,
      diagrams: lesson.diagrams,
      quiz: lesson.quizQuestions[0],
      worksheet: lesson.worksheetData,
      version: lesson.version,
    }
  })
  const base = {
    id: RESILIENT_PACK_ID,
    kind: 'pack',
    title: 'Resilient Learning Pack',
    subjects: lessons.map((lesson) => lesson.subject),
    courseIds: coreIds,
    lessons,
    readingResource: {
      title: 'Learning during a disruption',
      body: 'Choose a safe place, work in short sessions, write questions down, and ask a trusted adult or teacher for help when you reconnect.',
    },
    helpInstructions: [
      'Your saved lessons and work remain on this device.',
      'Keep the device charged when severe weather or an outage is expected.',
      'If conditions are unsafe, pause schoolwork and follow local emergency guidance.',
      'SyncED does not replace emergency alerts or instructions from local authorities.',
    ],
    totalEstimatedMinutes: 95,
    version: 1,
    sourceUpdatedAt: '2026-08-06T00:00:00.000Z',
  }
  const withSize = { ...base, byteSize: byteSize(base), estimatedFileSize: 'Under 1 MB' }
  return { ...withSize, byteSize: byteSize(withSize) }
}

async function persistPackage(packageData, onProgress) {
  onProgress?.(12)
  await Promise.resolve()
  onProgress?.(38)
  const record = { ...packageData, downloadedAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString() }
  onProgress?.(72)
  await putRecord('lessons', record)
  onProgress?.(100)
  notifyDownloadsChanged()
  return record
}

export async function downloadLesson(courseId, { online = true, onProgress } = {}) {
  if (!online) throw new Error('Connect to the internet before downloading a lesson.')
  return persistPackage(lessonPackage(courseId), onProgress)
}

export async function downloadResilientPack({ online = true, onProgress } = {}) {
  if (!online) throw new Error('Connect to the internet before downloading the learning pack.')
  const pack = await persistPackage(resilientPackPackage(), (progress) => onProgress?.(Math.round(progress * 0.15)))
  for (let index = 0; index < pack.courseIds.length; index += 1) {
    await persistPackage(lessonPackage(pack.courseIds[index]), (progress) => {
      const courseProgress = 15 + (((index + progress / 100) / pack.courseIds.length) * 85)
      onProgress?.(Math.round(courseProgress))
    })
  }
  onProgress?.(100)
  return pack
}

export async function getDownloadedLesson(courseId) {
  return getRecord('lessons', courseId)
}

export async function getDownloadedContent() {
  return (await getAllRecords('lessons')).sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt))
}

export function getCatalogVersion(courseId) {
  return CONTENT_VERSIONS[courseId] || 1
}

export async function removeDownloadedContent(id) {
  await deleteRecord('lessons', id)
  notifyDownloadsChanged()
}

export async function clearDownloadedContent() {
  await clearStore('lessons')
  notifyDownloadsChanged()
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}
