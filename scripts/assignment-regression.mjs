import assert from 'node:assert/strict'

export async function checkAssignmentDrafts(page) {
  const open = (name) => page.getByRole('button', { name: new RegExp(name) }).click()
  await open('Practice: equations')
  await page.getByLabel('Your response').fill('Algebra draft only')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await open('Ecosystem worksheet')
  assert.equal(await page.getByLabel('Your response').inputValue(), '')
  await page.getByLabel('Your response').fill('Science draft only')
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await page.reload()
  await page.getByTestId('launch-sequence').waitFor({ state: 'detached' })
  await open('Practice: equations')
  assert.equal(await page.getByLabel('Your response').inputValue(), 'Algebra draft only')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await open('Ecosystem worksheet')
  assert.equal(await page.getByLabel('Your response').inputValue(), 'Science draft only')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
}

export async function checkSavedSubmissionAndSync(page) {
  await page.reload()
  await page.getByTestId('launch-sequence').waitFor({ state: 'detached' })
  await page.getByRole('button', { name: /Practice: equations/ }).click()
  assert.equal(await page.getByLabel('Your response').inputValue(), 'I subtracted the same number from both sides.')
  assert.equal(await page.getByLabel('Your response').isDisabled(), true)
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  const readState = () => page.evaluate(() => localStorage.getItem('synced-demo-state-v2'))
  const before = await readState()
  await page.getByRole('button', { name: 'Simulate sync', exact: true }).click()
  await page.getByRole('button', { name: 'Simulate hub Wi-Fi', exact: true }).click()
  await page.getByText('Demo finished. Nothing was sent; your local records are unchanged.', { exact: true }).waitFor()
  assert.equal(await readState(), before, 'Simulating sync must preserve all local data')
}

export async function checkDeadlineTransitions(browser, baseUrl) {
  const context = await browser.newContext({ reducedMotion: 'reduce', timezoneId: 'America/Los_Angeles' })
  const page = await context.newPage()
  try {
    await page.clock.setFixedTime(new Date('2026-09-21T22:59:00Z'))
    await page.goto(baseUrl)
    await page.getByTestId('launch-sequence').waitFor({ state: 'detached' })
    await page.getByRole('button', { name: /Practice: equations/ }).click()
    await page.getByLabel('Your response').fill('A response saved after the fixed due time.')
    await page.clock.setFixedTime(new Date('2026-09-21T23:00:01Z'))
    await page.getByText('Late submission', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Submit assignment', exact: true }).click()
    await page.getByText('Saved late on this device. +15 points. Not sent to school.', { exact: true }).waitFor()
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('synced-demo-state-v2')).lateAssignments), [1])

    await page.getByRole('button', { name: /Ecosystem worksheet/ }).click()
    await page.getByLabel('Your response').fill('Draft before closing')
    await page.clock.setFixedTime(new Date('2026-09-25T00:00:00Z'))
    await page.getByRole('button', { name: 'Closed', exact: true }).waitFor()
    assert.equal(await page.getByLabel('Your response').isDisabled(), true)
    assert.equal(await page.getByRole('button', { name: 'Closed', exact: true }).isDisabled(), true)
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('synced-demo-state-v2')).completedAssignments), [1])
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await page.reload()
    await page.getByTestId('launch-sequence').waitFor({ state: 'detached' })
    await page.getByRole('button', { name: /Ecosystem worksheet/ }).click()
    assert.equal(await page.getByLabel('Your response').inputValue(), 'Draft before closing')
    assert.equal(await page.getByLabel('Your response').isDisabled(), true)
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await page.getByRole('button', { name: /Practice: equations/ }).click()
    assert.equal(await page.getByLabel('Your response').inputValue(), 'A response saved after the fixed due time.')
    assert.equal(await page.getByLabel('Your response').isDisabled(), true)
    await page.getByRole('button', { name: 'Submitted', exact: true }).waitFor()
  } finally {
    await context.close()
  }
}

export async function checkHelpSample(page) {
  const queueBefore = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('synced-demo-state-v2')).queueItems))
  assert.equal(await page.getByLabel('Sample email (not contacted)').inputValue(), 'maya@example.com')
  assert.equal(await page.getByLabel('Sample email (not contacted)').getAttribute('readonly'), '')
  await page.getByLabel('Your question').fill('Sample question: how do I open a lesson?')
  await page.getByRole('button', { name: 'Save sample', exact: true }).click()
  await page.getByRole('heading', { name: 'Sample saved on this device' }).waitFor()
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('synced-demo-state-v2')))
  assert.equal(state.helpRequests.at(-1).email, 'maya@example.com')
  assert.equal(JSON.stringify(state.queueItems), queueBefore)
}
