// Reports whether this runtime (browser, Android WebView, or iOS WKWebView)
// can plausibly run WebLLM. This is a hard gate for the on-device tutor
// feature: browser WebGPU support does not guarantee Capacitor WebView support.
export async function probeWebGpu() {
  const result = {
    hasNavigatorGpu: false,
    hasAdapter: false,
    hasShaderF16: false,
    adapterInfo: null,
    error: null,
  }

  try {
    result.hasNavigatorGpu = typeof navigator !== 'undefined' && 'gpu' in navigator
    if (!result.hasNavigatorGpu) return result

    const adapter = await navigator.gpu.requestAdapter()
    result.hasAdapter = Boolean(adapter)
    if (!adapter) return result

    result.hasShaderF16 = adapter.features?.has('shader-f16') ?? false
    if (typeof adapter.requestAdapterInfo === 'function') {
      const info = await adapter.requestAdapterInfo()
      result.adapterInfo = { vendor: info.vendor || null, architecture: info.architecture || null }
    }
  } catch (error) {
    result.error = error?.message || String(error)
  }

  return result
}

export function isTutorSupported(probeResult) {
  return probeResult.hasNavigatorGpu && probeResult.hasAdapter
}
