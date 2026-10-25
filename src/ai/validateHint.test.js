import { describe, expect, it } from 'vitest'
import { validateHint } from './validateHint.js'

describe('validateHint', () => {
  it('accepts a well-formed hint that does not leak the answer', () => {
    const result = validateHint('{"hint": "Think about what operation undoes addition."}', '8')
    expect(result.ok).toBe(true)
    expect(result.hint).toBe('Think about what operation undoes addition.')
  })

  it('rejects non-JSON output', () => {
    const result = validateHint('Sure! Here is a hint: try subtracting.', '8')
    expect(result).toEqual({ ok: false, reason: 'not-json' })
  })

  it('rejects JSON missing the hint field', () => {
    const result = validateHint('{"message": "try subtracting"}', '8')
    expect(result).toEqual({ ok: false, reason: 'missing-hint-field' })
  })

  it('rejects a non-string hint field', () => {
    const result = validateHint('{"hint": 42}', '8')
    expect(result).toEqual({ ok: false, reason: 'missing-hint-field' })
  })

  it('rejects a hint under 8 characters', () => {
    const result = validateHint('{"hint": "Try!"}', '8')
    expect(result).toEqual({ ok: false, reason: 'too-short' })
  })

  it('rejects a hint over 240 characters', () => {
    const longHint = 'a'.repeat(241)
    const result = validateHint(JSON.stringify({ hint: longHint }), '8')
    expect(result).toEqual({ ok: false, reason: 'too-long' })
  })

  it('rejects a hint that contains the correct answer, case-insensitively', () => {
    const result = validateHint('{"hint": "The answer is X = 8, just check it."}', 'x = 8')
    expect(result).toEqual({ ok: false, reason: 'leaks-answer' })
  })

  it('rejects a hint that contains the correct answer with extra whitespace normalized away', () => {
    const result = validateHint('{"hint": "It equals   8   after you subtract."}', '8')
    expect(result).toEqual({ ok: false, reason: 'leaks-answer' })
  })

  it('rejects a hint with leading "User:" scaffolding', () => {
    const result = validateHint('{"hint": "User: what should I do next?"}', '8')
    expect(result).toEqual({ ok: false, reason: 'conversation-scaffolding' })
  })

  it('rejects a hint with leading "Assistant:" scaffolding', () => {
    const result = validateHint('{"hint": "Assistant: try subtracting six from both sides."}', '8')
    expect(result).toEqual({ ok: false, reason: 'conversation-scaffolding' })
  })
})
