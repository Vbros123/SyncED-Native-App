import http from 'node:http'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright-core'

const root = path.resolve('dist')
const profileDir = await mkdtemp(path.join(tmpdir(), 'synced-offline-qa-'))
const browserCandidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
const executablePath = browserCandidates.find(existsSync)

if (!executablePath) throw new Error('No supported Chromium browser was found for offline QA.')

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
}

const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    let filePath = path.join(root, pathname === '/' ? 'index.html' : pathname)
    if (!filePath.startsWith(root)) throw new Error('Invalid path')
    try {
      if (!(await stat(filePath)).isFile()) filePath = path.join(root, 'index.html')
    } catch {
      filePath = path.join(root, 'index.html')
    }
    response.writeHead(200, { 'content-type': mime[path.extname(filePath)] || 'application/octet-stream', 'cache-control': 'no-cache' })
    response.end(await readFile(filePath))
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
})

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const baseUrl = `http://127.0.0.1:${server.address().port}`
const results = {}
let context

async function startContext(offline = false) {
  const next = await chromium.launchPersistentContext(profileDir, {
    executablePath,
    headless: true,
    offline,
    acceptDownloads: true,
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  await next.addInitScript(() => localStorage.setItem('synced-onboarding-complete', 'true'))
  return next
}

async function ready(page) {
  await page.getByRole('heading', { name: 'Good morning, Maya' }).waitFor({ timeout: 12_000 })
  await page.getByTestId('launch-sequence').waitFor({ state: 'detached', timeout: 12_000 }).catch(() => {})
}

async function readStore(page, storeName) {
  return page.evaluate((name) => new Promise((resolve, reject) => {
    const request = indexedDB.open('synced-offline-v3', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(name, 'readonly')
      const all = transaction.objectStore(name).getAll()
      all.onsuccess = () => resolve(all.result)
      all.onerror = () => reject(all.error)
      transaction.oncomplete = () => database.close()
    }
  }), storeName)
}

async function putStore(page, storeName, value) {
  return page.evaluate(({ name, record }) => new Promise((resolve, reject) => {
    const request = indexedDB.open('synced-offline-v3', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(name, 'readwrite')
      transaction.objectStore(name).put(record)
      transaction.oncomplete = () => { database.close(); resolve() }
      transaction.onerror = () => reject(transaction.error)
    }
  }), { name: storeName, record: value })
}

async function poll(check, timeout = 10_000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    const value = await check()
    if (value) return value
    await new Promise((resolve) => setTimeout(resolve, 120))
  }
  throw new Error('Timed out waiting for an offline QA condition.')
}

function assert(value, message) {
  if (!value) throw new Error(message)
}

try {
  context = await startContext(false)
  let page = context.pages()[0] || await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await ready(page)
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready(page)
  results.serviceWorkerControlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller))

  await page.locator('.side-nav').getByRole('button', { name: 'My learning', exact: true }).click()
  await page.getByRole('button', { name: 'Downloads', exact: true }).click()
  const algebraDownload = page.locator('.managed-download-row').filter({ hasText: 'Algebra basics' })
  await algebraDownload.getByRole('button', { name: 'Download', exact: true }).click()
  await algebraDownload.getByText('Downloaded', { exact: true }).waitFor({ timeout: 10_000 })
  results.downloadStored = (await readStore(page, 'lessons')).some((record) => record.id === 'algebra' && record.quizQuestions.length === 6 && record.version === 3 && record.worksheetData && record.diagrams.length)
  const geometryDownload = page.locator('.managed-download-row').filter({ hasText: 'Geometry and shapes' })
  await geometryDownload.getByRole('button', { name: 'Download', exact: true }).click()
  await geometryDownload.getByText('Downloaded', { exact: true }).waitFor({ timeout: 10_000 })
  results.expandedLessonPackage = (await readStore(page, 'lessons')).some((record) => record.id === 'geometry' && record.quizQuestions.length === 3 && record.worksheetData?.questions?.length === 3 && record.diagrams.length)

  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready(page)
  await page.locator('.side-nav').getByRole('button', { name: 'My learning', exact: true }).click()
  await page.getByRole('button', { name: 'Downloads', exact: true }).click()
  results.downloadPersistsAfterRefresh = await page.locator('.managed-download-row').filter({ hasText: 'Algebra basics' }).getByText('Downloaded', { exact: true }).isVisible()

  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready(page)
  await page.locator('.side-nav').getByRole('button', { name: 'Explore', exact: true }).click()
  await page.locator('.explore-card').filter({ hasText: 'Living systems' }).getByRole('button', { name: 'Start', exact: true }).click()
  results.undownloadedBlockedOffline = await page.getByText('Connect to the internet and download this lesson before using it offline.', { exact: true }).isVisible()
  await page.getByRole('button', { name: 'Close', exact: true }).click()

  await page.locator('.side-nav').getByRole('button', { name: 'My learning', exact: true }).click()
  await page.getByRole('button', { name: 'Downloads', exact: true }).click()
  await page.locator('.managed-download-row').filter({ hasText: 'Algebra basics' }).getByRole('button', { name: 'Open', exact: true }).click()
  await page.locator('.lesson-choice-list').getByRole('button', { name: /x = 6/ }).click()
  await page.getByRole('button', { name: 'Check answer', exact: true }).click()
  await page.locator('.answer-feedback.incorrect').getByText(/Attempt 1 saved/).waitFor()
  await page.getByRole('button', { name: /x = 8/ }).click()
  await page.getByRole('button', { name: 'Check answer', exact: true }).click()
  await page.locator('.answer-feedback.correct').getByText('Corrected.', { exact: true }).waitFor()

  const remainingAnswers = [/x = 7/, /\$4/, /11/, /6/, /2n \+ 6/]
  for (const answer of remainingAnswers) {
    await page.getByRole('button', { name: 'Next question', exact: true }).click()
    await page.locator('.lesson-choice-list').getByRole('button', { name: answer }).click()
    await page.getByRole('button', { name: 'Check answer', exact: true }).click()
    await page.locator('.answer-feedback.correct').waitFor()
  }

  const algebraActivities = await readStore(page, 'activities')
  const firstQuizResult = algebraActivities.find((activity) => activity.id === 'quiz-algebra-0')
  results.correctedScoring = firstQuizResult?.quizScore === 75 && firstQuizResult?.metadata?.attempts === 2 && firstQuizResult?.metadata?.firstAttemptCorrect === false
  const overview = page.locator('.quiz-overview')
  await overview.getByText('You answered all 6 questions.', { exact: true }).waitFor()
  results.quizOverview = await overview.getByText('96%', { exact: true }).isVisible()

  await page.locator('.side-nav').getByRole('button', { name: 'My learning', exact: true }).click()
  await page.getByRole('button', { name: /^Assignments/ }).click()
  await page.locator('.assignment-detail-row').filter({ hasText: 'Practice: equations' }).click()
  await page.getByLabel('Your response').fill('I subtracted the same amount from both sides.')
  await page.getByRole('button', { name: 'Submit assignment', exact: true }).click()
  await poll(async () => (await readStore(page, 'syncQueue')).length >= 2)
  const offlineQueue = await readStore(page, 'syncQueue')
  results.offlineActivityQueued = offlineQueue.some((item) => item.id === 'quiz-algebra-0') && offlineQueue.some((item) => item.id === 'assignment-1')
  results.localActivityComplete = (await readStore(page, 'activities')).every((activity) => ['id', 'activityType', 'timeCompleted', 'progressPercentage', 'pointsEarned', 'syncStatus', 'timestamp'].every((key) => key in activity))

  await page.evaluate(() => localStorage.removeItem('synced-device-state-v3'))
  await context.close()
  context = await startContext(true)
  page = context.pages()[0] || await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await ready(page)
  await poll(async () => (await readStore(page, 'activities')).some((activity) => activity.id === 'quiz-algebra-0'))
  await page.locator('.side-nav').getByRole('button', { name: 'My learning', exact: true }).click()
  await page.locator('.course-row').filter({ hasText: 'Algebra basics' }).getByRole('button', { name: 'Continue', exact: true }).click()
  results.progressPersistsAfterRestart = await page.getByText('You answered all 6 questions.', { exact: true }).isVisible()

  await context.setOffline(false)
  await poll(async () => (await readStore(page, 'syncQueue')).length === 0, 15_000)
  results.reconnectionAutoSync = (await readStore(page, 'activities')).filter((activity) => ['quiz-algebra-0', 'assignment-1'].includes(activity.id)).every((activity) => activity.syncStatus === 'synced')

  await page.locator('.side-nav').getByRole('button', { name: 'Settings', exact: true }).click()
  await page.locator('.settings-nav').getByRole('button', { name: 'Offline & storage', exact: true }).click()
  await page.getByRole('button', { name: 'Add fake failed sync', exact: true }).click()
  const failedEntry = await poll(async () => (await readStore(page, 'syncQueue')).find((entry) => entry.status === 'failed'), 12_000)
  const failedActivity = (await readStore(page, 'activities')).find((activity) => activity.id === failedEntry.activityId)
  results.failedSyncRetainsLocalData = Boolean(failedActivity && failedActivity.syncStatus !== 'synced' && failedEntry.lastError)
  await page.getByRole('button', { name: 'Retry synchronization', exact: true }).click()
  await poll(async () => (await readStore(page, 'syncQueue')).length === 0)

  const receiptsRecord = (await readStore(page, 'meta')).find((record) => record.key === 'prototype-server-receipts')
  const receiptCountBefore = receiptsRecord.ids.filter((id) => id === failedEntry.activityId).length
  await putStore(page, 'syncQueue', { ...failedEntry, status: 'pending', attempts: 0, forceFailureOnce: false, nextAttemptAt: Date.now(), updatedAt: new Date().toISOString() })
  await page.getByRole('button', { name: 'Retry synchronization', exact: true }).click()
  await poll(async () => (await readStore(page, 'syncQueue')).length === 0)
  const receiptsAfter = (await readStore(page, 'meta')).find((record) => record.key === 'prototype-server-receipts')
  results.duplicateSubmissionPrevented = receiptCountBefore === 1 && receiptsAfter.ids.filter((id) => id === failedEntry.activityId).length === 1

  const activityCountBeforeUpgrade = (await readStore(page, 'activities')).length
  await page.evaluate(async () => {
    await caches.open('synced-shell-v0')
    navigator.serviceWorker.controller.postMessage({ type: 'TEST_CACHE_UPGRADE' })
  })
  await poll(async () => page.evaluate(async () => !(await caches.keys()).includes('synced-shell-v0')))
  results.cacheUpgradePreservesProgress = (await readStore(page, 'activities')).length === activityCountBeforeUpgrade

  await page.locator('.language-control select').selectOption('ar')
  await page.getByRole('heading', { name: 'الإعدادات' }).waitFor()
  results.arabicRtl = await page.evaluate(() => document.documentElement.dir === 'rtl' && document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)
  await page.locator('.language-control select').selectOption('en')
  await page.setViewportSize({ width: 390, height: 844 })
  results.mobileNavigation = await page.locator('.mobile-nav').isVisible() && await page.locator('.mobile-nav').getByRole('button', { name: 'Home', exact: true }).isVisible()

  const required = {
    serviceWorkerControlled: results.serviceWorkerControlled,
    downloadStored: results.downloadStored,
    expandedLessonPackage: results.expandedLessonPackage,
    downloadPersistsAfterRefresh: results.downloadPersistsAfterRefresh,
    undownloadedBlockedOffline: results.undownloadedBlockedOffline,
    correctedScoring: results.correctedScoring,
    quizOverview: results.quizOverview,
    offlineActivityQueued: results.offlineActivityQueued,
    localActivityComplete: results.localActivityComplete,
    progressPersistsAfterRestart: results.progressPersistsAfterRestart,
    reconnectionAutoSync: results.reconnectionAutoSync,
    failedSyncRetainsLocalData: results.failedSyncRetainsLocalData,
    duplicateSubmissionPrevented: results.duplicateSubmissionPrevented,
    cacheUpgradePreservesProgress: results.cacheUpgradePreservesProgress,
    arabicRtl: results.arabicRtl,
    mobileNavigation: results.mobileNavigation,
  }
  Object.entries(required).forEach(([name, passed]) => assert(passed, `Offline QA failed: ${name}`))
  console.log(JSON.stringify(results, null, 2))
} finally {
  if (context) await context.close().catch(() => {})
  await new Promise((resolve) => server.close(resolve))
  await rm(profileDir, { recursive: true, force: true })
}
