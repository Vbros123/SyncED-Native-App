import { createServer } from 'vite'
import * as data from '../src/data.js'

const translatableFields = new Set([
  'audience',
  'availability',
  'category',
  'course',
  'description',
  'detail',
  'duration',
  'explanation',
  'hours',
  'instructions',
  'label',
  'level',
  'options',
  'partner',
  'plainDescription',
  'prompt',
  'services',
  'subject',
  'title',
  'type',
  'videoSlides',
  'videoTitle',
  'walk',
])

const sourceStrings = new Set()
const languageNeutral = /^[-\d$xX\s=+×÷−.]+$/u

function addStrings(value) {
  if (typeof value === 'string') sourceStrings.add(value)
  else if (Array.isArray(value)) value.forEach(addStrings)
  else if (value && typeof value === 'object') Object.values(value).forEach(addStrings)
}

function inspect(value) {
  if (Array.isArray(value)) {
    value.forEach(inspect)
    return
  }
  if (!value || typeof value !== 'object') return
  Object.entries(value).forEach(([key, nested]) => {
    if (translatableFields.has(key)) addStrings(nested)
    else inspect(nested)
  })
}

Object.entries(data).forEach(([name, value]) => {
  if (name !== 'languages') inspect(value)
})

const server = await createServer({ logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' })
try {
  const { messages } = await server.ssrLoadModule('/src/i18n.jsx')
  const missing = Object.fromEntries(
    Object.entries(messages).map(([language, dictionary]) => [
      language,
      [...sourceStrings].filter((source) => !languageNeutral.test(source) && dictionary[source] === undefined).sort(),
    ]),
  )
  const failures = Object.values(missing).reduce((count, items) => count + items.length, 0)
  if (failures) {
    console.error(`Missing ${failures} data translations:`)
    console.error(JSON.stringify(missing, null, 2))
    process.exitCode = 1
  } else {
    console.log(`Translation data audit passed: ${sourceStrings.size} source strings × ${Object.keys(messages).length} languages`)
  }
} finally {
  await server.close()
}
