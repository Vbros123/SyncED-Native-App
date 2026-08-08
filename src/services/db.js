export const DB_NAME = 'synced-offline-v3'
export const DB_VERSION = 1

let databasePromise

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
export function openDatabase() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB is not supported in this browser.'))
  if (databasePromise) return databasePromise

  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains('lessons')) {
        const lessons = database.createObjectStore('lessons', { keyPath: 'id' })
        lessons.createIndex('kind', 'kind', { unique: false })
        lessons.createIndex('downloadedAt', 'downloadedAt', { unique: false })
      }
      if (!database.objectStoreNames.contains('activities')) {
        const activities = database.createObjectStore('activities', { keyPath: 'id' })
        activities.createIndex('syncStatus', 'syncStatus', { unique: false })
        activities.createIndex('timestamp', 'timestamp', { unique: false })
        activities.createIndex('courseId', 'courseId', { unique: false })
      }
      if (!database.objectStoreNames.contains('syncQueue')) {
        const queue = database.createObjectStore('syncQueue', { keyPath: 'id' })
        queue.createIndex('status', 'status', { unique: false })
        queue.createIndex('nextAttemptAt', 'nextAttemptAt', { unique: false })
      }
      if (!database.objectStoreNames.contains('meta')) database.createObjectStore('meta', { keyPath: 'key' })
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => {
        database.close()
        databasePromise = undefined
      }
      resolve(database)
    }
    request.onerror = () => {
      databasePromise = undefined
      reject(request.error)
    }
    request.onblocked = () => reject(new Error('SyncED storage upgrade is blocked by another open tab.'))
  })

  return databasePromise
}

export async function getRecord(storeName, key) {
  const database = await openDatabase()
  return requestResult(database.transaction(storeName, 'readonly').objectStore(storeName).get(key))
}

export async function getAllRecords(storeName) {
  const database = await openDatabase()
  return requestResult(database.transaction(storeName, 'readonly').objectStore(storeName).getAll())
}

export async function putRecord(storeName, value) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).put(value)
    transaction.oncomplete = () => resolve(value)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export async function deleteRecord(storeName, key) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).delete(key)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export async function clearStore(storeName) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).clear()
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export async function putActivityWithQueue(activity, queueItem) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['activities', 'syncQueue'], 'readwrite')
    transaction.objectStore('activities').put(activity)
    const queue = transaction.objectStore('syncQueue')
    const existingRequest = queue.get(queueItem.id)
    existingRequest.onsuccess = () => {
      if (!existingRequest.result) queue.put(queueItem)
    }
    transaction.oncomplete = () => resolve(activity)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export async function markActivitySyncedAndRemoveQueue(activityId, syncedAt) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['activities', 'syncQueue'], 'readwrite')
    const activities = transaction.objectStore('activities')
    const request = activities.get(activityId)
    request.onsuccess = () => {
      if (request.result) activities.put({ ...request.result, syncStatus: 'synced', syncedAt })
    }
    transaction.objectStore('syncQueue').delete(activityId)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}
