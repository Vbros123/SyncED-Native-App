import { getRecord, putRecord } from './db.js'

const RECEIPTS_KEY = 'prototype-server-receipts'

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}
export async function submitActivityToPrototypeServer(activity, { slow = false, forceFailure = false } = {}) {
  await wait(slow ? 1100 : 180)
  if (forceFailure) throw new Error('Prototype sync server rejected this test item.')

  const receiptRecord = await getRecord('meta', RECEIPTS_KEY)
  const receipts = receiptRecord?.ids || []
  if (receipts.includes(activity.id)) return { ok: true, duplicate: true, activityId: activity.id }

  await putRecord('meta', { key: RECEIPTS_KEY, ids: [...receipts, activity.id], updatedAt: new Date().toISOString() })
  return { ok: true, duplicate: false, activityId: activity.id, receivedAt: new Date().toISOString() }
}
