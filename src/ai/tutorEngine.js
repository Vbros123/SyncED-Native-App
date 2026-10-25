import { probeWebGpu } from './webgpuProbe.js'

const MODEL_F16 = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'
const MODEL_F32 = 'Llama-3.2-1B-Instruct-q4f32_1-MLC'

function resolveModelId(probe, modelList) {
  const preferred = probe.hasShaderF16 ? MODEL_F16 : MODEL_F32
  const available = modelList.some((item) => item.model_id === preferred)
  if (available) return preferred
  return modelList.some((item) => item.model_id === MODEL_F32) ? MODEL_F32 : preferred
}

let enginePromise = null
let loadedTutor = null

// A timed-out worker may not answer unload messages. Termination releases it
// immediately and lets the next user request start with a fresh engine.
export function terminateTutorEngine() {
  loadedTutor?.worker.terminate()
  loadedTutor = null
  enginePromise = null
}

export async function loadTutorEngine(onProgress) {
  if (enginePromise) return enginePromise

  enginePromise = (async () => {
    const probe = await probeWebGpu()
    if (!probe.hasNavigatorGpu || !probe.hasAdapter) {
      throw new Error('WebGPU is not available on this device.')
    }

    if (navigator.storage?.persist) {
      try { await navigator.storage.persist() } catch { /* best-effort; not fatal if denied */ }
    }

    // Loaded on demand so users who never open the tutor never download
    // WebLLM's ~6 MB library bundle with the rest of the app shell.
    const { CreateWebWorkerMLCEngine, prebuiltAppConfig } = await import('@mlc-ai/web-llm')
    const modelId = resolveModelId(probe, prebuiltAppConfig.model_list)
    const worker = new Worker(new URL('./tutor.worker.js', import.meta.url), { type: 'module' })

    try {
      const engine = await CreateWebWorkerMLCEngine(worker, modelId, {
        initProgressCallback: onProgress,
      })
      loadedTutor = { engine, modelId, worker }
      return loadedTutor
    } catch (error) {
      worker.terminate()
      throw error
    }
  })()

  try {
    return await enginePromise
  } catch (error) {
    enginePromise = null
    throw error
  }
}

export async function unloadTutorEngine() {
  if (!enginePromise) return
  const loaded = await enginePromise.catch(() => null)
  enginePromise = null
  if (!loaded) return
  try {
    await loaded.engine.unload()
  } finally {
    loaded.worker.terminate()
    if (loadedTutor === loaded) loadedTutor = null
  }
}
