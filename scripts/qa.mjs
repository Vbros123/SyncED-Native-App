import http from 'node:http'
import { existsSync } from 'node:fs'
import { readFile, stat, mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium as playwrightChromium } from 'playwright-core'

const qaTemp = await mkdtemp(path.join(tmpdir(), 'synced-visual-qa-'))
const browserCandidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
let executablePath = browserCandidates.find(existsSync)
let browserArgs = ['--no-sandbox', '--disable-dev-shm-usage']
if (!executablePath) {
  process.getuid ||= () => 1000
  process.getgid ||= () => 1000
  const { default: bundledChromium } = await import('@sparticuz/chromium')
  executablePath = await bundledChromium.executablePath()
  browserArgs = bundledChromium.args
}

const root = path.resolve('dist')
const screenshotDir = path.join(qaTemp, 'screenshots')
await mkdir(screenshotDir, { recursive: true })

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
    const body = await readFile(filePath)
    response.writeHead(200, { 'content-type': mime[path.extname(filePath)] || 'application/octet-stream' })
    response.end(body)
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
})

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const baseUrl = `http://127.0.0.1:${server.address().port}`
const errors = []
const results = {}
let browser

try {
  browser = await playwrightChromium.launch({ args: browserArgs, executablePath, headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, acceptDownloads: true })
  await context.addInitScript(() => {
    localStorage.setItem('synced-onboarding-complete', 'true')
    window.__SYNCED_I18N_AUDIT__ = true
    window.__SYNCED_I18N_MISSES__ = {}
  })
  const page = await context.newPage()
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`) })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded' })
  const launchSequence = page.getByTestId('launch-sequence')
  await launchSequence.waitFor({ state: 'visible' })
  await page.waitForTimeout(900)
  results.launchStudents = await page.locator('.launch-student').count()
  results.launchCaps = await page.locator('.launch-cap').count()
  results.launchCopyOpacity = Number(await page.locator('.launch-copy').evaluate((element) => getComputedStyle(element).opacity))
  if (results.launchCopyOpacity < 0.95) throw new Error(`Launch copy is too faint: ${results.launchCopyOpacity}`)
  await page.screenshot({ path: `${screenshotDir}/launch-desktop.png`, fullPage: false })
  await launchSequence.waitFor({ state: 'detached', timeout: 5000 })
  await page.getByRole('heading', { name: 'Good morning, Maya' }).waitFor()
  results.desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await page.screenshot({ path: `${screenshotDir}/home-desktop.png`, fullPage: true })

  await page.getByRole('button', { name: 'Open assignment calendar' }).click()
  await page.getByRole('heading', { name: 'Assignment calendar' }).waitFor()
  results.calendarEvents = await page.locator('.calendar-event').count()
  await page.locator('.calendar-event').first().click()
  await page.getByLabel('Your response').fill('I subtracted the same number from both sides.')
  await page.getByRole('button', { name: 'Submit assignment' }).click()
  await page.getByText('Assignment submitted and queued to sync. +15 points.', { exact: true }).waitFor()
  results.assignmentSubmitted = true

  await page.locator('.side-nav').getByRole('button', { name: 'Explore', exact: true }).click()
  await page.getByRole('heading', { name: 'Explore lessons' }).waitFor()
  results.exploreSubjects = await page.locator('.explore-card').count()
  await page.getByRole('button', { name: 'Math', exact: true }).click()
  results.mathLessons = await page.locator('.explore-card').count()
  if (results.mathLessons !== 6) throw new Error(`Expected 6 Math lessons, found ${results.mathLessons}`)
  await page.getByRole('button', { name: 'All subjects', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.locator('.explore-card').first().getByRole('button', { name: 'Worksheet', exact: true }).click()
  const download = await downloadPromise
  results.worksheetDownload = download.suggestedFilename().includes('worksheet-en.html')
  await page.locator('.explore-card').filter({ hasText: 'Living systems' }).getByRole('button', { name: 'Start', exact: true }).click()
  await page.getByRole('heading', { name: 'Producers' }).waitFor()
  await page.getByRole('button', { name: /Play video/ }).click()
  await page.waitForTimeout(120)
  await page.getByRole('button', { name: /A grass plant/ }).click()
  await page.getByRole('button', { name: 'Check answer', exact: true }).click()
  await page.locator('.answer-feedback.correct').getByText('That’s right.', { exact: true }).waitFor()
  results.lessonCelebrationCaps = await page.locator('.correct-cap-burst .answer-cap').count()
  await page.waitForTimeout(420)
  await page.screenshot({ path: `${screenshotDir}/correct-answer-desktop.png`, fullPage: false })
  await page.getByRole('button', { name: 'Next question', exact: true }).click()
  await page.getByRole('heading', { name: 'Food webs' }).waitFor()
  await page.getByRole('button', { name: 'Previous', exact: true }).click()
  await page.getByRole('heading', { name: 'Producers' }).waitFor()
  await page.getByRole('button', { name: 'Save for later', exact: true }).click()
  await page.getByRole('button', { name: 'Saved for later', exact: true }).waitFor()
  await page.getByRole('button', { name: 'View sync queue', exact: true }).click()
  results.syncQueueRows = await page.locator('.sync-queue-row').count()
  await page.locator('.modal').getByRole('button', { name: 'Close', exact: true }).last().click()
  await page.screenshot({ path: `${screenshotDir}/lesson-desktop.png`, fullPage: true })

  await page.locator('.side-nav').getByRole('button', { name: 'Digital skills', exact: true }).click()
  await page.getByRole('heading', { name: 'Digital skills' }).waitFor()
  await page.locator('.skills-feature-band').getByRole('button', { name: 'Start lesson', exact: true }).click()
  await page.getByRole('button', { name: 'Try a quick check', exact: true }).click()
  await page.locator('.choice-list label').filter({ hasText: 'Open the official school app or ask a trusted adult' }).click()
  await page.getByRole('button', { name: 'Check answer', exact: true }).click()
  await page.getByText('Exactly.', { exact: true }).waitFor()
  results.skillCelebrationCaps = await page.locator('.correct-cap-burst .answer-cap').count()

  await page.locator('.side-nav').getByRole('button', { name: 'Rewards', exact: true }).click()
  await page.getByRole('heading', { name: 'Rewards' }).waitFor()
  await page.locator('.custom-gear-grid button').filter({ hasText: 'Focus headphones' }).click()
  await page.locator('.custom-gear-grid button').filter({ hasText: 'Star medal' }).click()
  await page.getByRole('tab', { name: 'Colors', exact: true }).click()
  await page.locator('.custom-color-groups > div').first().getByRole('button', { name: 'Choose Cosmic purple', exact: true }).click()
  await page.locator('.custom-color-groups > div').nth(1).getByRole('button', { name: 'Choose Mint green', exact: true }).click()
  await page.getByRole('tab', { name: 'Mood', exact: true }).click()
  await page.locator('.custom-mood-grid').getByRole('button', { name: 'Excited', exact: true }).click()
  const novaStageClass = await page.locator('.nova-stage').getAttribute('class')
  results.rewardCustomization = ['nova-headwear-headphones', 'nova-accessory-medal', 'nova-face-cosmic', 'nova-body-green', 'nova-expression-excited'].every((name) => novaStageClass.includes(name))
  await page.screenshot({ path: `${screenshotDir}/rewards-customized-desktop.png`, fullPage: true })

  await page.locator('.side-nav').getByRole('button', { name: 'Community hubs', exact: true }).click()
  await page.getByRole('heading', { name: 'Community access' }).waitFor()
  await page.getByPlaceholder('Enter city, ZIP code, hub, or service').fill('48207')
  results.locationSearchMatches = await page.locator('.hub-result').count()
  await page.getByRole('button', { name: 'Device support', exact: true }).click()
  await page.locator('.device-program').first().getByRole('button', { name: 'Request support', exact: true }).click()
  await page.getByLabel('Email for request updates').fill('maya@example.com')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Save request', exact: true }).click()
  await page.getByRole('heading', { name: 'Request received' }).waitFor()
  results.deviceEmail = await page.locator('.modal').getByText(/maya@example.com/).first().isVisible()
  await page.getByRole('button', { name: 'Done', exact: true }).click()

  await page.locator('.side-nav').getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('heading', { name: 'Settings' }).waitFor()
  await page.getByRole('switch', { name: 'Plain-language mode', exact: true }).click()
  results.plainMode = await page.getByRole('switch', { name: 'Plain-language mode', exact: true }).getAttribute('aria-checked')
  await page.locator('.settings-nav').getByRole('button', { name: 'Appearance', exact: true }).click()
  await page.getByRole('button', { name: 'Dark', exact: true }).click()
  results.darkTheme = await page.evaluate(() => document.documentElement.dataset.theme)
  await page.locator('.settings-nav').getByRole('button', { name: 'Language & reading', exact: true }).click()
  await page.locator('.select-setting select').selectOption('es')
  await page.getByRole('heading', { name: 'Ajustes' }).waitFor()
  results.spanishTranslated = await page.getByText('Cada pantalla, lección, hoja e instrucción usa el idioma que eliges.').isVisible()
  await page.locator('.language-control select').selectOption('ar')
  await page.getByRole('heading', { name: 'الإعدادات' }).waitFor()
  results.rtl = await page.evaluate(() => document.documentElement.dir)
  results.rtlOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await page.locator('.language-control select').selectOption('en')

  await page.locator('.side-nav').getByRole('button', { name: 'Help & about', exact: true }).click()
  await page.getByRole('heading', { name: 'Help & about' }).waitFor()
  await page.getByRole('button', { name: 'About & impact', exact: true }).click()
  results.evidenceCards = await page.locator('.evidence-grid article').count()
  results.sourceLinks = await page.locator('.evidence-grid a').count()
  await page.getByRole('button', { name: 'Privacy', exact: true }).click()
  await page.getByRole('heading', { name: /Collect less/ }).waitFor()
  await page.screenshot({ path: `${screenshotDir}/privacy-desktop.png`, fullPage: true })

  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  results.sidebarCollapsed = await page.locator('.app-shell').evaluate((element) => element.classList.contains('sidebar-is-collapsed'))

  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(220)
  await page.locator('.language-control select').selectOption('es')
  await page.locator('.mobile-nav').getByRole('button', { name: 'Inicio', exact: true }).click()
  await page.getByRole('heading', { name: 'Buenos días, Maya' }).waitFor()
  results.spanishDifficultyTranslated = await page.locator('.meta-line').filter({ hasText: 'Principiante' }).isVisible()
  results.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  results.mobileNavVisible = await page.locator('.mobile-nav').isVisible()
  results.mobileSidebarHidden = await page.locator('.sidebar').evaluate((element) => getComputedStyle(element).visibility === 'hidden')
  if (!results.mobileSidebarHidden) throw new Error('Closed mobile sidebar is still visible')
  await page.screenshot({ path: `${screenshotDir}/home-mobile-es.png`, fullPage: true })

  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const language of ['es', 'hi', 'ar', 'fr']) {
    await page.locator('.language-control select').selectOption(language)
    for (let screenIndex = 0; screenIndex < 9; screenIndex += 1) {
      await page.locator('.side-nav button').nth(screenIndex).click()
      await page.waitForTimeout(25)
      if (screenIndex === 1) {
        const tabs = page.locator('[role="tablist"] button')
        for (let tabIndex = 0; tabIndex < await tabs.count(); tabIndex += 1) await tabs.nth(tabIndex).click({ force: true })
      }
      if (screenIndex === 5) {
        const tabs = page.locator('.hubs-page > .wide-tabs button')
        for (let tabIndex = 0; tabIndex < await tabs.count(); tabIndex += 1) await tabs.nth(tabIndex).click({ force: true })
      }
      if (screenIndex === 4) {
        const tabs = page.locator('.customizer-tabs button')
        for (let tabIndex = 0; tabIndex < await tabs.count(); tabIndex += 1) await tabs.nth(tabIndex).click({ force: true })
      }
      if (screenIndex === 7) {
        const tabs = page.locator('.support-tabs button')
        for (let tabIndex = 0; tabIndex < await tabs.count(); tabIndex += 1) await tabs.nth(tabIndex).click({ force: true })
      }
      if (screenIndex === 8) {
        const tabs = page.locator('.settings-nav button')
        for (let tabIndex = 0; tabIndex < await tabs.count(); tabIndex += 1) await tabs.nth(tabIndex).click({ force: true })
      }
    }
  }
  results.translationMisses = await page.evaluate(() => window.__SYNCED_I18N_MISSES__)
  if (Object.values(results.translationMisses).some((items) => items.length)) throw new Error(`Missing translations: ${JSON.stringify(results.translationMisses)}`)

  await page.locator('.language-control select').selectOption('en')
  const serviceWorkerControlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller))
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByTestId('launch-sequence').waitFor({ state: 'detached', timeout: 8000 })
  await page.getByRole('heading', { name: 'Good morning, Maya' }).waitFor()
  results.offlineReload = true
  results.serviceWorkerControlled = serviceWorkerControlled
  await context.setOffline(false)

  await page.evaluate(() => {
    const key = 'synced-device-state-v3'
    const saved = JSON.parse(localStorage.getItem(key) || '{}')
    localStorage.setItem(key, JSON.stringify({
      ...saved,
      points: 350,
      mascot: { headwear: 'cap', accessory: 'backpack', faceColor: 'sunset', bodyColor: 'purple', expression: 'focused' },
      settings: { ...(saved.settings || {}), theme: 'light', plainLanguage: false },
    }))
    localStorage.setItem('synced-sidebar-collapsed', 'false')
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByTestId('launch-sequence').waitFor({ state: 'detached', timeout: 8000 })
  await page.locator('.side-nav').getByRole('button', { name: 'Rewards', exact: true }).click()
  await page.getByRole('heading', { name: 'Rewards' }).waitFor()
  results.rewardGearFits = await page.locator('.nova-character').evaluate((character) => {
    const characterBox = character.getBoundingClientRect()
    const items = [...character.querySelectorAll('.nova-cap, .nova-backpack')]
    return items.length === 2 && items.every((item) => {
      const itemBox = item.getBoundingClientRect()
      return itemBox.left >= characterBox.left - 1
        && itemBox.right <= characterBox.right + 1
        && itemBox.top >= characterBox.top - 1
        && itemBox.bottom <= characterBox.bottom + 1
    })
  })
  if (!results.rewardGearFits) throw new Error('Nova gear is outside the character stage')
  await page.screenshot({ path: `${screenshotDir}/rewards-backpack-desktop.png`, fullPage: true })

  results.consoleErrors = errors
  results.screenshots = [
    `${screenshotDir}/launch-desktop.png`,
    `${screenshotDir}/home-desktop.png`,
    `${screenshotDir}/correct-answer-desktop.png`,
    `${screenshotDir}/lesson-desktop.png`,
    `${screenshotDir}/rewards-customized-desktop.png`,
    `${screenshotDir}/rewards-backpack-desktop.png`,
    `${screenshotDir}/privacy-desktop.png`,
    `${screenshotDir}/home-mobile-es.png`,
  ]
  results.baseUrl = baseUrl
  console.log(JSON.stringify(results, null, 2))
} finally {
  if (browser) await browser.close()
  await new Promise((resolve) => server.close(resolve))
}
