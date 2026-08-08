import { useCallback, useEffect, useState } from 'react'
import { QUEUE_EVENT } from '../services/progressStorage.js'
import { getLastSuccessfulSync, getQueueEntries, processSyncQueue, requestBackgroundSync } from '../services/syncQueue.js'

export function useSyncQueue({ isOnline, isSlow }) {
  const [entries, setEntries] = useState([])
  const [lastSuccessfulSync, setLastSuccessfulSync] = useState(null)
  const [syncState, setSyncState] = useState('idle')

  const refresh = useCallback(async () => {
    const [nextEntries, lastSync] = await Promise.all([getQueueEntries(), getLastSuccessfulSync()])
    setEntries(nextEntries)
    setLastSuccessfulSync(lastSync)
    if (nextEntries.some((entry) => entry.status === 'failed')) setSyncState('failed')
    else if (!nextEntries.length) setSyncState('synced')
    else setSyncState('waiting')
  }, [])

  const sync = useCallback(async ({ ignoreBackoff = false } = {}) => {
    if (!isOnline) {
      setSyncState('offline')
      return { syncedCount: 0, failedCount: 0, remaining: entries.length }
    }
    setSyncState('syncing')
    try {
      const result = await processSyncQueue({ isOnline, slow: isSlow, ignoreBackoff })
      await refresh()
      return result
    } catch (error) {
      setSyncState('failed')
      throw error
    }
  }, [entries.length, isOnline, isSlow, refresh])

  useEffect(() => {
    refresh()
    window.addEventListener(QUEUE_EVENT, refresh)
    return () => window.removeEventListener(QUEUE_EVENT, refresh)
  }, [refresh])

  useEffect(() => {
    if (!isOnline || !entries.length) return undefined
    requestBackgroundSync()
    const timer = window.setTimeout(() => sync(), 250)
    return () => window.clearTimeout(timer)
  }, [isOnline, entries.length, sync])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (isOnline && entries.length && syncState !== 'syncing') sync()
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [entries.length, isOnline, sync, syncState])

  useEffect(() => {
    const onServiceWorkerMessage = (event) => {
      if (event.data?.type === 'PROCESS_SYNC_QUEUE' && isOnline) sync({ ignoreBackoff: true })
    }
    navigator.serviceWorker?.addEventListener('message', onServiceWorkerMessage)
    return () => navigator.serviceWorker?.removeEventListener('message', onServiceWorkerMessage)
  }, [isOnline, sync])

  return { entries, pendingCount: entries.length, lastSuccessfulSync, syncState, sync, refresh }
}
