const MIN_LENGTH = 8
const MAX_LENGTH = 240
const SCAFFOLDING_PATTERN = /^\s*(user|assistant|system)\s*:/i

function normalize(value) {
  return value.toLowerCase().trim().replace(/\s+/g, ' ')
}

// The safety layer between raw model output and what a child sees. Every
// rejection path here must be covered by a test — a hallucinated or
// answer-leaking hint is a worse outcome than falling back to the authored
// hint, so nothing here should be "probably fine."
export function validateHint(rawOutput, correctAnswerText) {
  let parsed
  try {
    parsed = JSON.parse(rawOutput)
  } catch {
    return { ok: false, reason: 'not-json' }
  }

  const hint = parsed?.hint
  if (typeof hint !== 'string') {
    return { ok: false, reason: 'missing-hint-field' }
  }

  const trimmedHint = hint.trim()

  if (trimmedHint.length < MIN_LENGTH) {
    return { ok: false, reason: 'too-short' }
  }

  if (trimmedHint.length > MAX_LENGTH) {
    return { ok: false, reason: 'too-long' }
  }

  if (SCAFFOLDING_PATTERN.test(trimmedHint)) {
    return { ok: false, reason: 'conversation-scaffolding' }
  }

  if (correctAnswerText != null && normalize(trimmedHint).includes(normalize(correctAnswerText))) {
    return { ok: false, reason: 'leaks-answer' }
  }

  return { ok: true, hint: trimmedHint }
}
