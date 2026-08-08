import { getAllRecords, getRecord, markActivitySyncedAndRemoveQueue, putRecord } from './db.js'
import { submitActivityToPrototypeServer } from './mockApi.js'
import { QUEUE_EVENT, saveActivity } from './progressStorage.js'

let runningPromise

function notifyQueueChanged() {
  window.dispatchEvent(new CustomEvent(QUEUE_EVENT))
}
export async function getQueueEntries() {
  return (await getAllRecords('syncQueue')).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export async function processSyncQueue({ isOnline, slow = false, ignoreBackoff = false, onItem } = {}) {
  if (!isOnline) throw new Error('Connect to the internet before synchronizing.')
  if (runningPromise) return runningPromise

  runningPromise = (async () => {
    const entries = await getQueueEntries()
    let syncedCount = 0
    let failedCount = 0

    for (const entry of entries) {
      if (!ignoreBackoff && entry.nextAttemptAt > Date.now()) continue
      const activity = await getRecord('activities', entry.activityId)
      if (!activity) {
        await markActivitySyncedAndRemoveQueue(entry.activityId, new Date().toISOString())
        continue
      }

      const syncingEntry = { ...entry, status: 'syncing', updatedAt: new Date().toISOString() }
      await putRecord('syncQueue', syncingEntry)
      notifyQueueChanged()
      onItem?.(syncingEntry)

      try {
        await submitActivityToPrototypeServer(activity, { slow, forceFailure: entry.forceFailureOnce })
        const syncedAt = new Date().toISOString()
        await markActivitySyncedAndRemoveQueue(entry.activityId, syncedAt)
        syncedCount += 1
        notifyQueueChanged()
      } catch (error) {
        const attempts = (entry.attempts || 0) + 1
        const backoff = Math.min(60_000, 1000 * (2 ** Math.min(attempts, 5)))
        await putRecord('syncQueue', {
          ...entry,
          status: 'failed',
          attempts,
          forceFailureOnce: false,
          lastError: error.message,
          updatedAt: new Date().toISOString(),
          nextAttemptAt: Date.now() + backoff,
        })
        failedCount += 1
        notifyQueueChanged()
      }
    }

    if (syncedCount) await putRecord('meta', { key: 'last-successful-sync', value: new Date().toISOString() })
    return { syncedCount, failedCount, remaining: (await getQueueEntries()).length }
  })()

  try {
    return await runningPromise
  } finally {
    runningPromise = undefined
  }
}

export async function getLastSuccessfulSync() {
  return (await getRecord('meta', 'last-successful-sync'))?.value || null
}

export async function addFakeFailedSync() {
  const id = `test-failure-${crypto.randomUUID()}`
  await saveActivity({
    id,
    activityType: 'test',
    metadata: { testFeature: true },
    progressPercentage: 0,
    pointsEarned: 0,
  }, { label: 'Offline Test Mode failure', type: 'Testing activity', forceFailureOnce: true })
  return id
}

export async function requestBackgroundSync() {
  if (!('serviceWorker' in navigator)) return false
  try {
    const registration = await navigator.serviceWorker.ready
    if (!('sync' in registration)) return false
    await registration.sync.register('synced-activity-queue')
    return true
  } catch {
    return false
  }
}
