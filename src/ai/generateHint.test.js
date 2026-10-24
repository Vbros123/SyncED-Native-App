import { describe, expect, it, vi } from 'vitest'
import { generateHint } from './generateHint.js'

function mockEngine(content) {
  return { chat: { completions: { create: vi.fn().mockResolvedValue({ choices: [{ message: { content } }] }) } } }
}
const input = { prompt: 'What undoes addition?', options: ['Subtract', 'Multiply'], languageLabel: 'English', correctAnswer: 'Subtract' }

describe('lesson AI hint generation', () => {
  it('requests bounded output without the constrained JSON decoder that stalls generation', async () => {
    const engine = mockEngine('{"hint":"Think about reversing the operation."}')
    expect(await generateHint(engine, input)).toBe('Think about reversing the operation.')
    const request = engine.chat.completions.create.mock.calls[0][0]
    expect(request.messages[1].content).toBe('Question: What undoes addition?\nOptions: Subtract | Multiply')
    expect(request.messages[0].content).toContain('Respond only in English.')
    expect(request).toMatchObject({ max_tokens: 80, stream: false })
    expect(request).not.toHaveProperty('response_format')
    expect(request.messages[0].content).toContain('Respond with ONLY a JSON object')
    expect(JSON.stringify(request)).not.toContain('correctAnswer')
  })

  it.each(['not json', '{"hint":"Subtract to get the answer."}', '{}'])('falls back for rejected model output: %s', async (raw) => {
    expect(await generateHint(mockEngine(raw), input)).toBeNull()
  })

  it('propagates engine failure for the UI fallback', async () => {
    const engine = mockEngine('')
    engine.chat.completions.create.mockRejectedValue(new Error('Device lost'))
    await expect(generateHint(engine, input)).rejects.toThrow('Device lost')
  })
})
