import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CONTENT_EVENT,
  RESILIENT_PACK_ID,
  clearDownloadedContent,
  downloadLesson,
  downloadResilientPack,
  getCatalogVersion,
  getDownloadedContent,
  removeDownloadedContent,
} from '../services/contentStorage.js'

export function useDownloads(isOnline) {
  const [records, setRecords] = useState([])
  const [transient, setTransient] = useState({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setRecords(await getDownloadedContent())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener(CONTENT_EVENT, refresh)
    return () => window.removeEventListener(CONTENT_EVENT, refresh)
  }, [refresh])

  const runDownload = useCallback(async (id, operation) => {
    setTransient((current) => ({ ...current, [id]: { status: 'downloading', progress: 1, error: null } }))
    try {
      await operation({ online: isOnline, onProgress: (progress) => setTransient((current) => ({ ...current, [id]: { status: 'downloading', progress, error: null } })) })
      setTransient((current) => ({ ...current, [id]: { status: 'downloaded', progress: 100, error: null } }))
      await refresh()
      return true
    } catch (error) {
      setTransient((current) => ({ ...current, [id]: { status: 'failed', progress: 0, error: error.message } }))
      return false
    }
  }, [isOnline, refresh])

  const download = useCallback((courseId) => runDownload(courseId, (options) => downloadLesson(courseId, options)), [runDownload])
  const downloadPack = useCallback(() => runDownload(RESILIENT_PACK_ID, downloadResilientPack), [runDownload])

  const remove = useCallback(async (id) => {
    await removeDownloadedContent(id)
    setTransient((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    await refresh()
  }, [refresh])

  const clear = useCallback(async () => {
    await clearDownloadedContent()
    setTransient({})
    await refresh()
  }, [refresh])

  const recordMap = useMemo(() => Object.fromEntries(records.map((record) => [record.id, record])), [records])
  const statusFor = useCallback((id) => {
    if (transient[id]?.status === 'downloading' || transient[id]?.status === 'failed') return transient[id]
    const record = recordMap[id]
    if (!record) return { status: 'not-downloaded', progress: 0, error: null }
    if (record.kind === 'lesson' && record.version < getCatalogVersion(id)) return { status: 'update-available', progress: 100, error: null }
    return { status: 'downloaded', progress: 100, error: null }
  }, [recordMap, transient])

  const lessonRecords = records.filter((record) => record.kind === 'lesson')
  const bytesUsed = records.reduce((total, record) => total + (record.byteSize || 0), 0)

  return {
    records,
    recordMap,
    lessonRecords,
    bytesUsed,
    loading,
    transient,
    statusFor,
    download,
    downloadPack,
    remove,
    clear,
    refresh,
  }
}
