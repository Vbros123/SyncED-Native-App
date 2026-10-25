import { buildSystemPrompt, buildUserPrompt } from './tutorPrompt.js'
import { validateHint } from './validateHint.js'

// Only lesson content enters the model. The answer is used locally for validation.
export async function generateHint(engine, { prompt, options, languageLabel, correctAnswer }) {
  const response = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: buildSystemPrompt(languageLabel) },
      { role: 'user', content: buildUserPrompt({ prompt, options }) },
    ],
    // Request JSON in the prompt and validate it below. WebLLM's constrained
    // JSON decoder can stall on this model even when plain decoding is fast.
    temperature: 0.3,
    max_tokens: 80,
    stream: false,
  })
  const result = validateHint(response.choices?.[0]?.message?.content || '', correctAnswer)
  return result.ok ? result.hint : null
}
