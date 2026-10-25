// The learner never types free text — the only trigger is a button — so this
// prompt is the entire input surface. The correct answer is deliberately
// never included: the model must not be able to restate it.
export function buildSystemPrompt(languageLabel) {
  return [
    'You are a patient tutor for a child using an offline learning app.',
    'You will be given a question prompt and, optionally, the options the learner can choose from.',
    'Give exactly ONE Socratic hint that nudges the learner toward the idea without stating or strongly implying the final answer.',
    'The hint must be at most two sentences, using simple, concrete words a child can understand.',
    'Stay strictly on the topic of the given question. Do not introduce unrelated facts or examples.',
    `Respond only in ${languageLabel}.`,
    'Respond with ONLY a JSON object of the exact shape {"hint": "..."} and nothing else — no markdown, no explanation, no extra fields.',
  ].join('\n')
}

export function buildUserPrompt({ prompt, options }) {
  const optionsLine = options?.length ? `\nOptions: ${options.join(' | ')}` : ''
  return `Question: ${prompt}${optionsLine}`
}
