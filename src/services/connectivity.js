export function getBrowserOnlineState() {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}
export function subscribeToConnectivity(callback) {
  const update = () => callback(getBrowserOnlineState())
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
  return () => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  }
}
