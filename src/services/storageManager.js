export async function getStorageInfo() {
  const storage = navigator.storage
  if (!storage) return { supported: false, usage: 0, quota: 0, persisted: null }
  const estimate = storage.estimate ? await storage.estimate() : { usage: 0, quota: 0 }
  const persisted = storage.persisted ? await storage.persisted() : null
  return { supported: true, usage: estimate.usage || 0, quota: estimate.quota || 0, persisted }
}
export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return null
  return navigator.storage.persist()
}

export function storageIsLow({ usage, quota }) {
  if (!quota) return false
  const remaining = quota - usage
  return remaining < 25 * 1024 * 1024 || usage / quota > 0.9
}
