import { useCallback, useEffect, useState } from 'react'
import { getStorageInfo, requestPersistentStorage, storageIsLow } from '../services/storageManager.js'

export function useStorageInfo() {
  const [info, setInfo] = useState({ supported: true, usage: 0, quota: 0, persisted: null, low: false, loading: true })

  const refresh = useCallback(async () => {
    try {
      const next = await getStorageInfo()
      setInfo({ ...next, low: storageIsLow(next), loading: false })
    } catch {
      setInfo({ supported: false, usage: 0, quota: 0, persisted: null, low: false, loading: false })
    }
  }, [])

  const requestPersistence = useCallback(async () => {
    await requestPersistentStorage()
    await refresh()
  }, [refresh])

  useEffect(() => { refresh() }, [refresh])

  return { ...info, refresh, requestPersistence }
}
