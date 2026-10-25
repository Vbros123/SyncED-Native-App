import assert from 'node:assert/strict'

export async function checkAiFallback(browser, baseUrl) {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } })
  try {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'gpu', { configurable: true, value: undefined })
    })
    const page = await context.newPage()
    const modelRequests = []
    page.on('request', (request) => {
      if (/huggingface|\.wasm|tutor\.worker/.test(request.url())) modelRequests.push(request.url())
    })
    await page.goto(baseUrl)
    await page.getByTestId('launch-sequence').waitFor({ state: 'detached' })
    await page.getByRole('button', { name: 'Continue', exact: true }).first().click()
    const tutor = page.getByRole('region', { name: 'AI hint', exact: true })
    await tutor.getByText('AI is unavailable on this device. You can still use the learning tip below.').waitFor()
    assert.equal(await tutor.getByRole('button', { name: 'Download / use AI hint' }).isDisabled(), true)
    await tutor.getByText('Learning tip', { exact: true }).click()
    await tutor.getByText('Review the video and choose the answer that best matches the key idea.').waitFor()
    await page.setViewportSize({ width: 390, height: 844 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.deepEqual(modelRequests, [], 'Opening lessons must never download AI weights automatically')
  } finally {
    await context.close()
  }
}
