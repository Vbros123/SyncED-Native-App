let sharedAudioContext

function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') sharedAudioContext = new AudioContext()
  return sharedAudioContext
}

function playChime(context) {
  const start = context.currentTime + 0.015
  const notes = [523.25, 659.25, 783.99]

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const noteStart = start + index * 0.075
    const noteEnd = noteStart + 0.28

    oscillator.type = index === 2 ? 'triangle' : 'sine'
    oscillator.frequency.setValueAtTime(frequency, noteStart)
    gain.gain.setValueAtTime(0.0001, noteStart)
    gain.gain.exponentialRampToValueAtTime(index === 2 ? 0.13 : 0.1, noteStart + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(noteStart)
    oscillator.stop(noteEnd + 0.02)
  })
}

export function playCorrectSound() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('synced:sound', { detail: { name: 'correct' } }))

  try {
    const context = getAudioContext()
    if (!context) return
    if (context.state === 'suspended') {
      context.resume().then(() => playChime(context)).catch(() => {})
      return
    }
    playChime(context)
  } catch {
    // Answer checking still works if a browser blocks Web Audio.
  }
}
